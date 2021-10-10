import path from "path";
import chalk from "chalk";

/** @typedef {import('../types/main').Error} Error */
/** @typedef {import('../types/main').ExternalLink} ExternalLink */

/**
 * @param {Error[]} errors
 * @param {number} maxReferencesPerError
 * @param {*} relativeFrom
 */
export function formatErrors(
  errors,
  maxReferencesPerError,
  relativeFrom = process.cwd()
) {
  let output = [];
  let number = 0;
  for (const error of errors) {
    number += 1;
    const filePath = path.relative(relativeFrom, error.filePath);
    if (error.onlyAnchorMissing === true) {
      output.push(
        `${number}. missing ${chalk.red.bold(
          `id="${error.usage[0].anchor}"`
        )} in ${chalk.cyanBright(filePath)}`
      );
    } else {
      const firstAttribute = error.usage[0].attribute;
      const title =
        firstAttribute === "src" || firstAttribute === "srcset"
          ? "file"
          : "reference target";

      output.push(`${number}. missing ${title} ${chalk.red.bold(filePath)}`);
    }
    const usageLength = error.usage.length;

    for (
      let i = 0;
      i < (maxReferencesPerError || Number.POSITIVE_INFINITY) &&
      i < usageLength;
      i += 1
    ) {
      const usage = error.usage[i];
      const usagePath = path.relative(relativeFrom, usage.file);
      const clickAbleLink = chalk.cyanBright(
        `${usagePath}:${usage.line + 1}:${usage.character}`
      );
      const attributeStart = chalk.gray(`${usage.attribute}="`);
      const attributeEnd = chalk.gray('"');
      output.push(
        `  from ${clickAbleLink} via ${attributeStart}${usage.value}${attributeEnd}`
      );
    }
    if (usageLength > (maxReferencesPerError || Number.POSITIVE_INFINITY)) {
      const more = chalk.red((usageLength - 3).toString());
      output.push(`  ... ${more} more references to this target`);
    }
    output.push("");
  }
  return output.join("\n");
}

/**
 * @param {ExternalLink[]} externalLinks
 * @param {*} relativeFrom
 */
export function formatExternalLinks(
  externalLinks,
  relativeFrom = process.cwd()
) {
  const output = [];
  for (const externalLink of externalLinks) {
    // for (const usage of externalLink.usage) {
    const usagePath = path.relative(relativeFrom, externalLink.usage[0].file);
    const clickAbleLink = chalk.cyanBright(
      `${usagePath}:${externalLink.usage[0].line + 1}:${
        externalLink.usage[0].character
      }`
    );
    output.push(
      `from ${clickAbleLink} EXTERNAL ${externalLink.usage[0].value}`
    );
    // }
  }
  return output.join("\n");
}
