export interface BaseSerializedAnnotation {
  annotationType: number;
  pageIndex: number;
  rect: number[];
  rotation: number;
  structTreeParentId: null;
  popupRef: string;
  color: number[] | ([number, number, number] & {});
  // opacity: number;
  // thickness: number;
  // quadPoints: {
  //   [index: string]: number;
  // };
  // outlines: number[] | number[][];
  id: null;
}
export interface SerializedFreeTextAnnotation extends BaseSerializedAnnotation {
  fontSize: number;
  value: string;
}
export interface SerializedTextHighlightAnnotation
  extends BaseSerializedAnnotation {
  opacity: number;
  thickness: number;
  quadPoints: {
    [index: string]: number;
  };
  outlines: number[] | number[][];
}
export interface SerializedInkAnnotation extends BaseSerializedAnnotation {
  opacity: number;
  thickness: number;
  quadPoints: null;
  outlines: {
    outline: (null | number)[];
    points: number[] | number[][];
  };
}
export interface SerializedFreeHighlightAnnotation
  extends SerializedInkAnnotation {}

export type pdfjsSerializedAnnotation =
  | SerializedFreeTextAnnotation
  | SerializedTextHighlightAnnotation
  | SerializedInkAnnotation
  | SerializedFreeHighlightAnnotation;

interface ExtraAnnotationField {
  type?: string;
  author?: string;
  subject?: string;
  contents?: string;
  creationDate?: string;
  updateDate?: string;
  is_deleted?: boolean;
  opacity?: number;
}
export type SerializedAnnotation = pdfjsSerializedAnnotation &
  ExtraAnnotationField;
