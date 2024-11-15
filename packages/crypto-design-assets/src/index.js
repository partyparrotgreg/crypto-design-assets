import fs from "fs";
import { parse } from "node-html-parser";
import path from "path";

// Source and destination paths
const SRC_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "src/originals"
);
const TOKENS_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "dist/tokens"
);
const COMPONENTS_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "dist/components"
);

// Utility to ensure a directory exists
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Check if SVG is square
function isSquareSVG(filePath) {
  const svgContent = fs.readFileSync(filePath, "utf-8");
  const root = parse(svgContent);
  const svgTag = root.querySelector("svg");
  if (!svgTag) return false;

  const width = parseFloat(svgTag.getAttribute("width") || 0);
  const height = parseFloat(svgTag.getAttribute("height") || 0);

  return width === height && width > 0;
}

// Convert SVG file to JSX component
function createJSXComponent(name, svgContent) {
  return `
import React from 'react';

const ${name} = (props) => (
  ${svgContent.replace("<svg", "<svg {...props}")}
);

export default ${name};
`.trim();
}

// Recursively process directories and files
function processDirectory(srcDir, relativePath = "") {
  const files = fs.readdirSync(srcDir);

  files.forEach((file) => {
    const fullPath = path.join(srcDir, file);
    const relativeFilePath = path.join(relativePath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      // Process subdirectory
      processDirectory(fullPath, relativeFilePath);
    } else if (path.extname(file).toLowerCase() === ".svg") {
      // Check if SVG is square
      if (isSquareSVG(fullPath)) {
        // Copy SVG to tokens folder
        const destDir = path.join(TOKENS_DIR, relativePath);
        ensureDirExists(destDir);
        fs.copyFileSync(fullPath, path.join(destDir, file));

        // Generate JSX component
        const svgContent = fs.readFileSync(fullPath, "utf-8");
        const componentName = file
          .replace(".svg", "")
          .replace(/[-_](.)/g, (_, g) => g.toUpperCase());
        const jsxContent = createJSXComponent(componentName, svgContent);

        // Save JSX component
        const componentDir = path.join(COMPONENTS_DIR, relativePath);
        ensureDirExists(componentDir);
        fs.writeFileSync(
          path.join(componentDir, `${componentName}.jsx`),
          jsxContent,
          "utf-8"
        );

        console.log(`Processed: ${file}`);
      } else {
        console.log(`Skipped (not square): ${file}`);
      }
    }
  });
}

// Main execution
(function main() {
  ensureDirExists(TOKENS_DIR);
  ensureDirExists(COMPONENTS_DIR);

  processDirectory(SRC_DIR);
  console.log("Processing complete!");
})();
