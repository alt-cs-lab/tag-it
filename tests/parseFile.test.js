import { expect, test } from 'vitest'
import parseFile from '../helpers/parseFile'

let docxStr = "This is testing the .docx parse file, this text should be returned from parsing:The quick brown fox jumped over the lazy dog ,<.>/?;:'\"[{]}-_=+`~1!2@3#4$5%6^7&8*9(0)\\|"

let pdfStr = "This is testing the .pdf parse file, this text should be returned from parsing: The quick brown fox jumped over the lazy dog ,<.>/?;:’”[{]}-_=+`~1!2@3#4$5%6^7&8*9(0)\\|"

let docxPath = "tests/testFiles/DocxParseTest.docx"
let pdfPath = "tests/testFiles/PdfParseTest.pdf"
let zipPath = "tests/testFiles/ZipParseText.zip"

test('Test Parse Docx text', async () => {
   // expect(__dirname).toBe('foo')
   const initialObj = await parseFile('DocxParseTest.docx', docxPath)
   if(!initialObj.text) return
   //const fixedText = initialObj.text.replace(/(?:\r\n|\r|\n)/g, '')
   //const fixedObj = {'filename': initialObj.filename, 'text': fixedText}

   expect(initialObj.text).toMatch(docxStr)

   // expect(fixedObj).toEqual([{'filename': 'DocxParseTest.docx', 'text': fixedText}])
})

test('Test Parse Docx filename', async () => {
    // expect(__dirname).toBe('foo')
    const filename = 'DocxParseTest.docx'
    const result = await parseFile(filename, docxPath)
    expect(result[0].filename).toEqual(filename)
 })

 test('Test Parse Docx Text', async () => {
    const initialObj = await parseFile('DocxParseTest.docx', docxPath)
    if(!initialObj.text) return
    const fixedText = initialObj.text.replace(/(?:\r\n|\r|\n)/g, '')
    expect(fixedText).toMatch(docxStr)
})


test('Test Parse Pdf Filename', async () => {
    const initialObj = await parseFile('PdfParseTest.pdf', pdfPath)
    const pdfFilename = "PdfParseTest.pdf"
    expect(initialObj[0].filename).toEqual(pdfFilename)
})

test('Test Parse Pdf Text', async () => {
    const initialObj = await parseFile('PdfParseTest.pdf', pdfPath)
    if(!initialObj.text) return
    const fixedText = initialObj.text.replace(/(?:\r\n|\r|\n)/g, '')
    expect(fixedText).toMatch(pdfStr)
})

test('Test Parse Zip Filenames', async () => {
    const docxFilename = 'DocxParseTest.docx'
    const pdfFilename = 'PdfParseTest.pdf'
    const initialArray = await parseFile('DockParseTest.zip', zipPath)
    const testArray = []
    for(let i = 0; i < initialArray.length; i++) {
        const filename = initialArray[i].filename;
        testArray.push(filename)
    }
    expect(testArray[0]).toMatch(docxFilename)
    expect(testArray[1]).toMatch(pdfFilename)
})

test('Test Parse Zip Text', async () => {
    const initialArray = await parseFile('DockParseTest.zip', zipPath)
    const testArray = []
    for(let i = 0; i < initialArray.length; i++) {
        const text = initialArray[i].text
        const fixedText = text.replace(/(?:\r\n|\r|\n)/g, '')
        testArray.push(fixedText)
    }
    expect(testArray[0]).toMatch(docxStr)
    expect(testArray[1]).toMatch(pdfStr)
})


