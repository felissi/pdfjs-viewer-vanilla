import type { AnnotationFactory } from "annotpdf";
import type { SerializedAnnotation } from "./serialized-annotation";

export type Annotation = Awaited<
  ReturnType<AnnotationFactory["getAnnotations"]>
>[number][number];

export function serialize(annot: Annotation): SerializedAnnotation {
  return {
    ...annot,
    annotationType: serializeAnnotType(annot),
    rect: annot.rect,
    color: Object.values(annot.color || { r: 0, g: 0, b: 0 }),
    pageIndex: annot.page,
    ...(annot.border?.border_width && {
      thickness: annot.border.border_width,
    }),
    id: annot.id,
    quadPoints: annot?.quadPoints,
  };
}

function serializeAnnotType(annot: Annotation): number {
  switch (annot.type) {
    case "/Ink":
      return 9;
    case "/Highlight":
      return 9;
    case "/Text":
      return 3;
    case "/FreeHighlight":
      return 9;
    default:
      return 1;
  }
}
