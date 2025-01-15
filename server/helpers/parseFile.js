const fs = require('fs/promises');
const path = require('path');
const decompress = require('decompress');
const pdfParse = require('pdf-parse');
const WordExtractor = require("word-extractor"); 

/**
 * Parses a PDF, DOCX, or ZIP file containing PDF and ZIP files and returns an 
 * array of objects with keys {filename, text} representing the file contents.
 * @param {string} filename - the (original) name of the file
 * @param {string} filepath - the path to the file 
 * @returns An array of objects with keys {filename, text}
 */
async function parseFile(filename, filepath) {
    switch(path.extname(filename)) {
        case '.pdf':
            return [await parsePdf(filename, filepath)];
        case '.docx':
            return [await parseDocx(filename, filepath)];
        case '.zip':
            return parseZip(filepath);
        default:
            console.log("Unknown type");
    }
}

/**
 * Helper function used by pdf-parse to subsitute standard whitespace
 * for positional data in PDFs
 * @param {*} pageData 
 * @returns 
 */
async function renderPage(pageData) {
    let renderOptions = {
        normalizeWhitepace: true,
        disableCombineTextItems: false
    }
    let textBlock = await pageData.getTextContent(renderOptions);
    console.log({textBlock});
    return textBlock;
}

/**
 * Parses the file at `filepath` and returns an object 
 * representing its contents
 * @param {*} filename - the (original) filename
 * @param {*} filepath - the path to the file
 * @returns 
 */
async function parsePdf(filename, filepath) {
    const buffer = await fs.readFile(filepath);
    const data = await pdfParse(buffer);
    const text = data.text;
    console.log('in parsePdf', {text});
    return { filename, text };
}

/**
 * Parses the file at `filepath` and returns an object 
 * representing its contents
 * @param {*} filename - the (original) filename
 * @param {*} filepath - the path to the file
 * @returns 
 */
async function parseDocx(filename, filepath) {
    const extractor = new WordExtractor();
    const extracted = await extractor.extract(filepath);
    const text = extracted.getBody();
    return { filename, text };
}

/** 
 * Parses the contents of the zip file at `filepath` and returns 
 * an array of objects representing its contents
 * @param {*} filepath - the path to the file
 * @returns An array of objects with keys {filename, text, hash}
 */
async function parseZip(filepath) {
    const files = await decompress(filepath, "uploads");
    // Process files
    const objs = await Promise.all(files.map(file => {
        console.log(file.path);
        switch(path.extname(file.path)) {
            case '.pdf':
                return parsePdf(path.basename(file.path), path.join("uploads", file.path));
            case '.docx':
                return parseDocx(path.basename(file.path), path.join("uploads", file.path));
            default:
                console.log("Unknown type");
        }
    }));
    // Delete unzipped files 
    await Promise.all(files.map(file => fs.unlink(path.join("uploads", file.path))));
    // TODO: Remove empties!
    return objs;
}

module.exports = parseFile;