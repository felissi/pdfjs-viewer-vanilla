import { AnnotationFactory } from "annotpdf";
import { serialize } from "./serialize";

export type AnnotationArray = Awaited<
  ReturnType<AnnotationFactory["getAnnotations"]>
>[number];
type PDFAnnotations = AnnotationArray[];

function exportPDFAnnotations(annotations: PDFAnnotations) {
  // if (Array.isArray(annotations)) {
  return annotations.map((annotations) => annotations.map(serialize));
  // }
}
function loadPDFAnnotations(pdfFactory: AnnotationFactory,annotations: PDFAnnotations) {
  // if (Array.isArray(annotations)) {
  // return annotations.map((annotations) => annotations.map(serialize));
  // }
  for (const pageAnnots of annotations) {
    for (const annot of pageAnnots) {
      // pdfFactory.addAnnotation(annot);
      switch (annot.type):
        case "/Ink":
          pdfFactory.createInkAnnotation(annot.page, annot.rect, "", "", annot.color || { r: 0, g: 0, b: 0 }, annot.quadPoints);
          break;
        case "/Highlight":
          pdfFactory.createHighlightAnnotation(annot.page, annot.rect, "", "", annot.color || { r: 0, g: 0, b: 0 }, annot.quadPoints);
          break;
        case "/Text":
          pdfFactory.createTextAnnotation(annot.page, annot.rect, "", "", annot.color || { r: 0, g: 0, b: 0 }, annot.quadPoints);
    }
  }
}
