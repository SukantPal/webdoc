// @flow

// This file has helper functions for extracting metadata from AST nodes.

import {
  type ClassDeclaration,
  type ClassExpression,
  type ClassMethod,
  type FunctionExpression,
  type FunctionDeclaration,
  type InterfaceDeclaration,
  type TSMethodSignature,
  isAssignmentPattern,
  isClassDeclaration,
  isClassExpression,
  isIdentifier,
  isRestElement,
  isObjectExpression,
} from "@babel/types";

import type {Param} from "@webdoc/types";

// Extracts all the extended class/interface names
export function extractExtends(
  node: ClassDeclaration | ClassExpression | InterfaceDeclaration,
): ?(string[]) {
  if (isClassDeclaration(node) || isClassExpression(node)) {
    if (isIdentifier(node.superClass)) {
      return [node.superClass.name];
    }

    return null;
  }

  return node.extends ? node.extends.map((identifier) => identifier.name) : null;
}

// Extracts all the implemented interface names
export function extractImplements(node: ClassDeclaration | ClassExpression): ?(string[]) {
  return node.implements ? node.implements.map((classImplements) => classImplements.id.name) : null;
}

// Extract all the parameter-data from the method/function AST node
export function extractParams(
  node: ClassMethod | FunctionDeclaration | FunctionExpression | TSMethodSignature,
): Param[] {
  if (!node.params && !node.parameters) {
    return [];
  }

  const nodeParams = node.params ? node.params : node.parameters;

  const params: Param[] = [];

  for (let i = 0; i < nodeParams.length; i++) {
    const paramNode = nodeParams[i];

    // TODO: Infer types
    if (isIdentifier(paramNode)) {
      params.push({
        identifier: paramNode.name,
        optional: paramNode.optional || false,
      });
    } else if (isRestElement(paramNode)) {
      params.push({
        identifier: paramNode.argument.name,
        optional: paramNode.optional || false,
        variadic: true,
      });
    } else if (isAssignmentPattern(paramNode)) {
      params.push({
        identifier: paramNode.left.name,
        optional: paramNode.optional || false,
        default: paramNode.right.raw,
      });
    } else if (isObjectExpression(paramNode)) {
      // TODO: Find a way to document {x, y, z} parameters
      // e.g. function ({x, y, z}), you would need to give the object pattern an anonymous like
      // "", " ", "  ",  "    " or using &zwnj; because it is truly invisible
      console.error("Object patterns as parameters can't be documented");
    } else {
      console.error("Parameter node couldn't be parsed");
    }
  }

  return params;
}
