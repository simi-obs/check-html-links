/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @typedef {import('../types/main').CheckHtmlLinksCliOptions} CheckHtmlLinksCliOptions */

import path from "path";
import chalk from "chalk";

import commandLineArgs from "command-line-args";
import { validateFiles } from "./validateFolder.js";
import { formatErrors, formatExternalLinks } from "./formatErrors.js";
import { listFiles } from "./listFiles.js";

export class CheckHtmlLinksCli {
  /** @type {CheckHtmlLinksCliOptions} */
  options;

  constructor({ argv } = { argv: undefined }) {
    const mainDefinitions = [
      { name: "ignore-link-pattern", type: String, multiple: true },
      { name: "root-dir", type: String, defaultOption: true },
      { name: "continue-on-error", type: Boolean, defaultOption: false },
      { name: "show-external-links", type: Boolean },
      { name: "max-references-per-error", type: Number },
      { name: "consider-prefix-as-local", type: String },
    ];
    const options = commandLineArgs(mainDefinitions, {
      stopAtFirstUnknown: true,
      argv,
    });
    this.options = {
      printOnError: true,
      continueOnError: options["continue-on-error"],
      rootDir: options["root-dir"],
      ignoreLinkPatterns: options["ignore-link-pattern"],
      showExternalLinks: options["show-external-links"] || false,
      maxReferencesPerError: options["max-references-per-error"],
      considerPrefixAsLocal: options["consider-prefix-as-local"],
    };
  }

  /**
   * @param {Partial<CheckHtmlLinksCliOptions>} newOptions
   */
  setOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions,
    };
  }

  async run() {
    const {
      ignoreLinkPatterns,
      rootDir: userRootDir,
      maxReferencesPerError,
      considerPrefixAsLocal,
    } = this.options;
    const rootDir = userRootDir ? path.resolve(userRootDir) : process.cwd();
    const performanceStart = process.hrtime();

    console.log("👀 Checking if all internal links work...");
    const files = await listFiles("**/*.html", rootDir);

    const filesOutput =
      files.length == 0
        ? "🧐 No files to check. Did you select the correct folder?"
        : `🔥 Found a total of ${chalk.green.bold(
            files.length
          )} files to check!`;
    console.log(filesOutput);

    const { errors, numberLinks, externalLinks } = await validateFiles(
      files,
      rootDir,
      {
        ignoreLinkPatterns,
        considerPrefixAsLocal,
      }
    );

    console.log(
      `🔗 Found a total of ${chalk.green.bold(
        numberLinks
      )} links to validate!\n`
    );

    const performance = process.hrtime(performanceStart);
    /** @type {string[]} */
    let output = [];
    let message = "";
    if (errors.length > 0) {
      let referenceCount = 0;
      for (const error of errors) {
        referenceCount += error.usage.length;
      }
      output = [
        `❌ Found ${chalk.red.bold(
          errors.length.toString()
        )} missing reference targets (used by ${referenceCount} links) while checking ${
          files.length
        } files:`,
        ...formatErrors(errors, maxReferencesPerError)
          .split("\n")
          .map((line) => `  ${line}`),
        `Checking links duration: ${performance[0]}s ${
          performance[1] / 1000000
        }ms`,
      ];
      message = output.join("\n");
      if (this.options.printOnError === true) {
        console.error(message);
      }
      if (this.options.continueOnError === false) {
        process.exit(1);
      }
    } else {
      console.log(
        `✅ All internal links are valid. (executed in ${performance[0]}s ${
          performance[1] / 1000000
        }ms)`
      );
    }

    if (this.options.showExternalLinks && externalLinks.length) {
      console.log(
        `\n❓ EXTERNAL links to check:\n${formatExternalLinks(externalLinks)}`
      );
    }

    return { errors, externalLinks, message };
  }
}
