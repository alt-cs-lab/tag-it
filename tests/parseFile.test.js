import { expect, test } from 'vitest'
import parseFile from '../helpers/parseFile'

let docxStr = "This is testing the .docx parse file, this text should be returned from parsing:\nThe quick brown fox jumped over the lazy dog ,<.>/?;:’”[{]}-_=+`~1!2@3#4$5%6^7&8*9(0)\\|"

let pdfStr = "This is testing the .pdf parse file, this text should be returned from parsing:\nThe quick brown fox jumped over the lazy dog ,<.>/?;:’”[{]}-_=+`~1!2@3#4$5%6^7&8*9(0)\\|"

let docxPath = "tests/testFiles/DocxParseTest.docx"
let pdfPath = "tests/testFiles/PdfParseTest.pdf"

test('Test Parse Docx', async () => {
   // expect(__dirname).toBe('foo')
    expect(await parseFile('DocxParseTest.docx', docxPath))
    .toBe([{'filename': 'DocxParseTest.docx', 'text': docxStr}])
})

test('Test Parse Pdf', async () => {
    expect(await parseFile('PdfParseTest.pdf', pdfPath))
    .toBe([{'filename': 'PdfParseTest.pdf'.trim(), 'text': pdfStr.trim()}])
})


