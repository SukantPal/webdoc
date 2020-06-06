// @flow
import type {Doc, ReturnTag} from "@webdoc/types";
import {parserLogger, tag} from "../Logger";
import {parseDataType} from "@webdoc/model";

// @return {<DATA_TYPE>} [-] <DESC>

// Parse the "@return {ReturnType} description" tag
export function parseReturn(value: string, doc: $Shape<Doc>): ReturnTag {
  // Get {ReferredType}
  const refClosure = /{([^{}])+}/.exec(value);
  let dataType;
  let description;

  if (!refClosure) {
    // eslint-disable-next-line max-len
    parserLogger.warn(tag.TagParser, "@return has not defined the {OriginalType}; defaulting to {any}");
    description = value;
  } else {
    dataType = refClosure[0].slice(1, -1);
    description = value.replace(
      new RegExp(`(.{${refClosure.index}}).{${refClosure.index + refClosure[0].length}}`), "$1");
  }

  if (!doc.returns) {
    doc.returns = [];
  }

  doc.returns.push({
    dataType: dataType ? parseDataType(dataType) : undefined,
    description,
  });

  return {
    name: "return",
    dataType,
    description,
    type: "ReturnTag",
  };
}
