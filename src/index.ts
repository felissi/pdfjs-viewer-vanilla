import type { PDFPageProxy } from "pdfjs-dist";
import {
  getDocument,
  GlobalWorkerOptions,
  AnnotationEditorType,
  AnnotationLayer,
  AnnotationMode,
  AnnotationEditorLayer,
  AnnotationEditorUIManager,
} from "pdfjs-dist";
import {
  TextLayerBuilder,
  EventBus,
  PDFViewer,
  PDFFindController,
  PDFLinkService,
  // DefaultAnnotationLayerFactory,
  // DefaultTextLayerFactory,
  PDFHistory,
  PDFScriptingManager,
} from "pdfjs-dist/web/pdf_viewer.mjs";
// import {} from "pdfjs-dist/display/editor/";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

import { PDFDocument, rgb } from "pdf-lib";
// import { AnnotationFactory } from "@digital-blueprint/annotpdf";
import { AnnotationFactory } from "annotpdf";

// import "pdfjs-dist/build/pdf.mjs";
// import "pdfjs-dist/web/pdf_viewer.mjs";

// import "pdfjs-dist/web/pdf_viewer.css";
import "./viewer-dist.css";

GlobalWorkerOptions.workerSrc = pdfjsWorker;

(async function () {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  page.drawText("hello", {
    x: 50,
    y: height - 4 * 30,
    size: 30,
    color: rgb(0, 0.5, 0.7),
  });
  const pdfBytes = await pdfDoc.save();
  console.log(`🚀 // DEBUG 🍔  ~ file: index.ts:15 ~ `, pdfBytes);
  // renderPdf(pdfBytes);

  const pdf = await getDocument({
    // url: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf",
    url: "compressed.tracemonkey-pldi-09.pdf",
    useWorkerFetch: false,
  }).promise;
  console.log(`🚀 // DEBUG 🍔  ~ file: index.ts:49 ~ `, pdf.annotationStorage);

  // const page2 = await pdf.getPage(1);
  // renderPdf(page2);

  // const pageProxy = await getPage(pdfBytes);
  // const text = await pageProxy.getTextContent();
  // console.log(`🚀 // DEBUG 🍔  ~ file: index.ts:32 ~ `, text);

  // const textLayer = new TextLayerBuilder({ pdfPage: page2 });
  // console.log(`🚀 // DEBUG 🍔  ~ file: index.ts:36 ~ `, textLayer);

  // await textLayer.show();
  // await textLayer.render({ viewport: pageProxy.getViewport({ scale: 1 }) });
  // await textLayer.show();
  // document.body.appendChild(textLayer.div);
  const { pdfViewer, linkService, eventBus, getAnnotationEditorUIManager } =
    getViewer();
  pdfViewer.setDocument(pdf);
  linkService.setDocument(pdf, null);

  // Update page counter
  eventBus.on("pagesinit", () => {
    document.getElementById("page-count").textContent = pdf.numPages;
    document.getElementById("scale").textContent = pdfViewer.currentScale;
  });
  document.getElementById("page-num").textContent = pdfViewer.currentPageNumber;
  eventBus.on("pagechanging", (e) => {
    document.getElementById("page-num").textContent = e.pageNumber;
  });

  document.getElementById("prev")!.addEventListener("click", () => {
    if (pdfViewer.currentPageNumber > 1) pdfViewer.currentPageNumber--;
  });

  document.getElementById("next")!.addEventListener("click", () => {
    if (pdfViewer.currentPageNumber < pdfViewer.pagesCount)
      pdfViewer.currentPageNumber++;
  });

  document.getElementById("zoom-in")!.addEventListener("click", () => {
    pdfViewer.currentScale += 0.25;
    document.getElementById("scale").textContent = pdfViewer.currentScale;
  });

  document.getElementById("zoom-out")!.addEventListener("click", () => {
    pdfViewer.currentScale -= 0.25;
    document.getElementById("scale").textContent = pdfViewer.currentScale;
  });

  document.getElementById("highlight")!.addEventListener("click", () => {
    console.log(
      `🚀 // DEBUG 🍔  ~ file: index.ts:96 ~ `,
      pdfViewer.annotationEditorMode,
      AnnotationEditorType.HIGHLIGHT
    );

    // pdfViewer.annotationEditorMode = {
    //   ...pdfViewer.annotationEditorMode,
    //   mode:
    //     pdfViewer.annotationEditorMode === AnnotationEditorType.HIGHLIGHT
    //       ? AnnotationEditorType.NONE
    //       : AnnotationEditorType.HIGHLIGHT,
    // };
    pdfViewer.annotationEditorMode = {
      mode:
        pdfViewer.annotationEditorMode === AnnotationEditorType.HIGHLIGHT
          ? AnnotationEditorType.NONE
          : AnnotationEditorType.HIGHLIGHT,
    };
    // eventBus.dispatch("switchannotationeditormode", {
    //   source: this,
    //   mode: AnnotationEditorType.HIGHLIGHT,
    // });

    const annotation = {
      subtype: "Highlight",
      rect: [100, 700, 300, 720], // [x1, y1, x2, y2] in PDF coords
      quadPoints: [
        // REQUIRED for text highlights
        100, 720, 300, 720, 300, 700, 100, 700,
      ],
      color: { r: 255, g: 255, b: 0 }, // RGB
      opacity: 0.4,
      contents: "Important text",
      author: "User",
      creationDate: new Date(),
    };

    pdf.annotationStorage.setValue("test", annotation);
    // pdf.annotationStorage.updateEditor('test')
  });

  document.getElementById("popup")!.addEventListener("click", () => {
    pdfViewer.annotationEditorMode = {
      mode: AnnotationEditorType.POPUP,
    };
    console.log(
      `🚀 // DEBUG 🍔  ~ file: index.ts:149 ~ `,
      pdfViewer.annotationEditorMode
    );
  });
  document.getElementById("text")!.addEventListener("click", () => {
    pdfViewer.annotationEditorMode = {
      mode: AnnotationEditorType.FREETEXT,
    };
    console.log(
      `🚀 // DEBUG 🍔  ~ file: index.ts:159 ~ `,
      pdfViewer.annotationEditorMode
    );
  });
  document.getElementById("draw")!.addEventListener("click", () => {
    pdfViewer.annotationEditorMode = {
      mode: AnnotationEditorType.INK,
    };
    console.log(
      `🚀 // DEBUG 🍔  ~ file: index.ts:159 ~ `,
      pdfViewer.annotationEditorMode
    );
  });
  document.getElementById("undo")!.addEventListener("click", () => {
    const manager = getAnnotationEditorUIManager();

    if (manager) {
      manager.undo();
    }
  });
  document.getElementById("redo")!.addEventListener("click", () => {
    const manager = getAnnotationEditorUIManager();

    if (manager) {
      manager.redo();
    }
  });

  document.getElementById("save")!.addEventListener(
    "click",
    () => {
      pdf.saveDocument().then((_) => {
        const blob = new Blob([_.buffer], { type: "application/pdf" });
        const a = document.createElement("a");
        const link = URL.createObjectURL(blob);
        a.href = link;
        a.download = "test.pdf";
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(link);
          a.remove();
        });
      });
    },
    { passive: true }
  );
  document.getElementById("show")!.addEventListener("click", () => {
    pdfViewer.annotationEditorMode =
      pdfViewer.annotationEditorMode?.mode === AnnotationEditorType.NONE
        ? { mode: AnnotationEditorType.DISABLE }
        : { mode: AnnotationEditorType.NONE };
  });

  const pdfFactory = new AnnotationFactory(await pdf.getData());
  // pdfFactory.createHighlightAnnotation(
  //   // pdfViewer.currentPageNumber - 1,
  //   0,
  //   [0, 0, 60, 20],
  //   "TEST_CONTENT",
  //   "TEST_AUTHOR",
  //   { r: 255, g: 0, b: 0 }
  // );
  // const inkAnnot = pdfFactory.createInkAnnotation(
  //   0,
  //   [
  //     56.270358234643936, 454.1388351917267, 252.45674934983253,
  //     568.0152096748352,
  //   ],
  //   "",
  //   "",
  //   [
  //     61.125003814697266, 526.5, 72.375, 537.75, 76.125, 540.75, 83.625, 546.75,
  //     88.87500762939453, 550.5, 94.875, 555, 100.125, 558, 105.375, 561,
  //     109.875, 563.25, 113.625, 564.75, 116.625, 564.75, 117.37499237060547,
  //     555, 117.37499237060547, 548.25, 117.37499237060547, 544.5, 115.875, 537,
  //     114.375, 531.75, 112.12500762939453, 525.75, 109.875, 521.25, 107.625,
  //     513.75, 105.375, 508.5, 103.12500762939453, 504.75, 101.625, 502.5,
  //     122.625, 522, 127.875, 525.75, 133.875, 528.75, 146.625, 535.5, 151.125,
  //     537, 155.62498474121094, 539.25, 160.125, 540.75, 163.12498474121094,
  //     540.75, 168.375, 540.75, 170.625, 540, 171.37498474121094, 533.25,
  //     171.37498474121094, 528.75, 171.37498474121094, 524.25,
  //     171.37498474121094, 521.25, 170.625, 518.25, 169.875, 516, 168.375, 513,
  //     167.625, 510.75, 165.37498474121094, 507.75, 178.125, 514.5, 184.125,
  //     516.75, 186.375, 517.5, 193.125, 519, 196.87501525878906, 519.75, 199.875,
  //     519.75, 202.125, 519.75, 205.12501525878906, 518.25, 207.37498474121094,
  //     512.25, 208.875, 504, 208.875, 499.5, 208.875, 496.5, 208.875, 486.75,
  //     208.875, 482.25, 208.125, 478.5, 207.37498474121094, 467.25,
  //     207.37498474121094, 464.25, 207.37498474121094, 461.25,
  //     207.37498474121094, 459, 208.125, 456.75, 215.62498474121094, 457.5,
  //     220.875, 459, 228.375, 460.5, 232.875, 460.5, 238.125, 461.25, 243.375,
  //     462, 247.87498474121094, 462, 250.125, 462, 251.625, 462,
  //   ],
  //   { r: 255, g: 255, b: 152 }
  // );
  // // pdfFactory.annotations.at(-1).border.border_width = 24;
  // // pdfFactory.annotations.at(-1).opacity = 0.45;
  // // // inkAnnot.border.border_width = 24;
  // // // inkAnnot.opacity = 0.45;
  // console.log(`🚀 // DEBUG 🍔  ~ file: index.ts:257 ~ `, inkAnnot);

  // pdfFactory.createHighlightAnnotation(
  //   0,
  //   [
  //     316.3428018093109, 405.58320584893227, 556.9812079668045,
  //     427.759206533432,
  //   ],
  //   "",
  //   "",
  //   { r: 128, g: 235, b: 255 },
  //   [
  //     472.4208984375, 426.890625, 556.3317260742188, 426.890625, 472.4208984375,
  //     416.390625, 556.3317260742188, 416.390625, 317.015625, 416.90625,
  //     358.156494140625, 416.90625, 317.015625, 406.40625, 358.156494140625,
  //     406.40625,
  //   ]
  // );
  pdfFactory.createFreeTextAnnotation(
    0,
    [79.12500000000001, 663.02734375, 136.6875, 683.5],
    "TEXT-2012",
    ""
  );
  pdfFactory.createTextAnnotation(
    0,
    [79.12500000000001, 663.02734375, 136.6875, 683.5],
    "Pop up note",
    ""
  );
  pdfFactory.createFreeHighlightAnnotation(
    0,
    [
      428.04633808135986, 465.84317886829376, 607.9681731462479,
      604.113153219223,
    ],
    "",
    "",
    [
      [
        445.8750305175781, 484.5, 442.875, 501.75, 441.375, 514.5, 440.625,
        537.75, 442.875, 554.25, 447.375, 569.25, 452.625, 583.5, 455.625,
        595.5, 458.625, 606, 469.8750305175781, 597, 472.875, 594.75, 478.125,
        589.5, 487.875, 576, 499.125, 555, 519.375, 512.25, 537.375, 487.5,
        544.875, 476.25, 553.125, 464.25, 532.125, 471, 517.125, 478.5, 503.625,
        483.75, 484.1250305175781, 492.75, 472.1249694824219, 498, 461.625, 501,
        445.8750305175781, 504.75, 433.8749694824219, 505.5, 423.375, 505.5,
        417.375, 505.5, 490.875, 517.5, 541.875, 525, 583.875, 534, 602.625,
        538.5, 605.625, 538.5, 606.375, 539.25,
      ],
    ],
    { r: 255, g: 255, b: 152 }
  );
  // pdfFactory.annotations.at(-1).border.border_width = 12;
  // pdfFactory.annotations.at(-1).opacity = 0.5;
  console.log(
    `🚀 // DEBUG 🍔  ~ file: index.ts:315 ~ `,
    "added A free highlight"
  );

  const pdf3 = await getDocument({ data: pdfFactory.write() }).promise;
  pdfViewer.setDocument(pdf3);
  const pdf3AnnotationEditorLayer = {
    get value() {
      return (pdfViewer._layerProperties as LayerProperties)
        ?.annotationEditorUIManager?.currentLayer as
        | AnnotationEditorLayer
        | undefined;
    },
  };
  console.log(
    `🚀 // DEBUG 🍔  ~ file: index.ts:259 ~ `,
    pdfViewer,
    pdfViewer._layerProperties,
    pdf3.annotationStorage,
    "editor layer",
    pdf3AnnotationEditorLayer
  );
  // setTimeout(() => {
  //   pdfViewer.forceRendering();
  //   pdfViewer.update();
  //   pdfViewer.renderingQueue?.renderView();
  // }, 2000);

  // pdfViewer.eventBus.on("pagechanging", () => {
  //   const myHighlightEditor =
  //     pdf3AnnotationEditorLayer.value?.createAndAddNewEditor(
  //       { x: 678, y: 379 } as PointerEvent,
  //       false,
  //       {
  //         highlightId: 5,
  //         highlightOutlines: {
  //           firstPoint: [0.6699935793876648, 0.35147547721862793],
  //           lastPoint: [0.7538217306137085, 0.4294990301132202],
  //         },
  //         clipPathId: "url(#clip_path_p1_5)",
  //         methodOfCreation: "main_toolbar",
  //       }
  //     );
  // });

  document.getElementById("save-anno")!.addEventListener("click", async () => {
    const blob = new Blob([await pdf3.saveDocument()], {
      type: "application/pdf",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "test-anno.pdf";
    a.click() && URL.revokeObjectURL(a.href);
  });

  eventBus.dispatch("find", { type: "", query: "Just" });
})();

async function renderPdf(page: PDFPageProxy) {
  // const loadingTask = getDocument({ data: pdfBytes, useWorkerFetch: false });
  // const pdf = await loadingTask.promise;
  // const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  document.body.appendChild(canvas);

  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas,
  });
}
async function getPage(pdfBytes: Uint8Array) {
  const loadingTask = getDocument({ data: pdfBytes, useWorkerFetch: false });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  return page;
}

function getViewerConfiguration() {
  return {
    appContainer: document.body,
    principalContainer: document.getElementById("mainContainer"),
    mainContainer: document.getElementById("viewerContainer"),
    viewerContainer: document.getElementById("viewer"),
    viewerAlert: document.getElementById("viewer-alert"),
    toolbar: {
      container: document.getElementById("toolbarContainer"),
      numPages: document.getElementById("numPages"),
      pageNumber: document.getElementById("pageNumber"),
      scaleSelect: document.getElementById("scaleSelect"),
      customScaleOption: document.getElementById("customScaleOption"),
      previous: document.getElementById("previous"),
      next: document.getElementById("next"),
      zoomIn: document.getElementById("zoomInButton"),
      zoomOut: document.getElementById("zoomOutButton"),
      print: document.getElementById("printButton"),
      editorCommentButton: document.getElementById("editorCommentButton"),
      editorCommentParamsToolbar: document.getElementById(
        "editorCommentParamsToolbar"
      ),
      editorFreeTextButton: document.getElementById("editorFreeTextButton"),
      editorFreeTextParamsToolbar: document.getElementById(
        "editorFreeTextParamsToolbar"
      ),
      editorHighlightButton: document.getElementById("editorHighlightButton"),
      editorHighlightParamsToolbar: document.getElementById(
        "editorHighlightParamsToolbar"
      ),
      editorHighlightColorPicker: document.getElementById(
        "editorHighlightColorPicker"
      ),
      editorInkButton: document.getElementById("editorInkButton"),
      editorInkParamsToolbar: document.getElementById("editorInkParamsToolbar"),
      editorStampButton: document.getElementById("editorStampButton"),
      editorStampParamsToolbar: document.getElementById(
        "editorStampParamsToolbar"
      ),
      editorSignatureButton: document.getElementById("editorSignatureButton"),
      editorSignatureParamsToolbar: document.getElementById(
        "editorSignatureParamsToolbar"
      ),
      download: document.getElementById("downloadButton"),
    },
    secondaryToolbar: {
      toolbar: document.getElementById("secondaryToolbar"),
      toggleButton: document.getElementById("secondaryToolbarToggleButton"),
      presentationModeButton: document.getElementById("presentationMode"),
      openFileButton:
        typeof PDFJSDev === "undefined" || PDFJSDev.test("GENERIC")
          ? document.getElementById("secondaryOpenFile")
          : null,
      printButton: document.getElementById("secondaryPrint"),
      downloadButton: document.getElementById("secondaryDownload"),
      viewBookmarkButton: document.getElementById("viewBookmark"),
      firstPageButton: document.getElementById("firstPage"),
      lastPageButton: document.getElementById("lastPage"),
      pageRotateCwButton: document.getElementById("pageRotateCw"),
      pageRotateCcwButton: document.getElementById("pageRotateCcw"),
      cursorSelectToolButton: document.getElementById("cursorSelectTool"),
      cursorHandToolButton: document.getElementById("cursorHandTool"),
      scrollPageButton: document.getElementById("scrollPage"),
      scrollVerticalButton: document.getElementById("scrollVertical"),
      scrollHorizontalButton: document.getElementById("scrollHorizontal"),
      scrollWrappedButton: document.getElementById("scrollWrapped"),
      spreadNoneButton: document.getElementById("spreadNone"),
      spreadOddButton: document.getElementById("spreadOdd"),
      spreadEvenButton: document.getElementById("spreadEven"),
      imageAltTextSettingsButton: document.getElementById(
        "imageAltTextSettings"
      ),
      imageAltTextSettingsSeparator: document.getElementById(
        "imageAltTextSettingsSeparator"
      ),
      documentPropertiesButton: document.getElementById("documentProperties"),
    },
    sidebar: {
      // Divs (and sidebar button)
      outerContainer: document.getElementById("outerContainer"),
      sidebarContainer: document.getElementById("sidebarContainer"),
      toggleButton: document.getElementById("sidebarToggleButton"),
      resizer: document.getElementById("sidebarResizer"),
      // Buttons
      thumbnailButton: document.getElementById("viewThumbnail"),
      outlineButton: document.getElementById("viewOutline"),
      attachmentsButton: document.getElementById("viewAttachments"),
      layersButton: document.getElementById("viewLayers"),
      // Views
      thumbnailView: document.getElementById("thumbnailView"),
      outlineView: document.getElementById("outlineView"),
      attachmentsView: document.getElementById("attachmentsView"),
      layersView: document.getElementById("layersView"),
      // View-specific options
      currentOutlineItemButton: document.getElementById("currentOutlineItem"),
    },
    findBar: {
      bar: document.getElementById("findbar"),
      toggleButton: document.getElementById("viewFindButton"),
      findField: document.getElementById("findInput"),
      highlightAllCheckbox: document.getElementById("findHighlightAll"),
      caseSensitiveCheckbox: document.getElementById("findMatchCase"),
      matchDiacriticsCheckbox: document.getElementById("findMatchDiacritics"),
      entireWordCheckbox: document.getElementById("findEntireWord"),
      findMsg: document.getElementById("findMsg"),
      findResultsCount: document.getElementById("findResultsCount"),
      findPreviousButton: document.getElementById("findPreviousButton"),
      findNextButton: document.getElementById("findNextButton"),
    },
    passwordOverlay: {
      dialog: document.getElementById("passwordDialog"),
      label: document.getElementById("passwordText"),
      input: document.getElementById("password"),
      submitButton: document.getElementById("passwordSubmit"),
      cancelButton: document.getElementById("passwordCancel"),
    },
    documentProperties: {
      dialog: document.getElementById("documentPropertiesDialog"),
      closeButton: document.getElementById("documentPropertiesClose"),
      fields: {
        fileName: document.getElementById("fileNameField"),
        fileSize: document.getElementById("fileSizeField"),
        title: document.getElementById("titleField"),
        author: document.getElementById("authorField"),
        subject: document.getElementById("subjectField"),
        keywords: document.getElementById("keywordsField"),
        creationDate: document.getElementById("creationDateField"),
        modificationDate: document.getElementById("modificationDateField"),
        creator: document.getElementById("creatorField"),
        producer: document.getElementById("producerField"),
        version: document.getElementById("versionField"),
        pageCount: document.getElementById("pageCountField"),
        pageSize: document.getElementById("pageSizeField"),
        linearized: document.getElementById("linearizedField"),
      },
    },
    altTextDialog: {
      dialog: document.getElementById("altTextDialog"),
      optionDescription: document.getElementById("descriptionButton"),
      optionDecorative: document.getElementById("decorativeButton"),
      textarea: document.getElementById("descriptionTextarea"),
      cancelButton: document.getElementById("altTextCancel"),
      saveButton: document.getElementById("altTextSave"),
    },
    newAltTextDialog: {
      dialog: document.getElementById("newAltTextDialog"),
      title: document.getElementById("newAltTextTitle"),
      descriptionContainer: document.getElementById(
        "newAltTextDescriptionContainer"
      ),
      textarea: document.getElementById("newAltTextDescriptionTextarea"),
      disclaimer: document.getElementById("newAltTextDisclaimer"),
      learnMore: document.getElementById("newAltTextLearnMore"),
      imagePreview: document.getElementById("newAltTextImagePreview"),
      createAutomatically: document.getElementById(
        "newAltTextCreateAutomatically"
      ),
      createAutomaticallyButton: document.getElementById(
        "newAltTextCreateAutomaticallyButton"
      ),
      downloadModel: document.getElementById("newAltTextDownloadModel"),
      downloadModelDescription: document.getElementById(
        "newAltTextDownloadModelDescription"
      ),
      error: document.getElementById("newAltTextError"),
      errorCloseButton: document.getElementById("newAltTextCloseButton"),
      cancelButton: document.getElementById("newAltTextCancel"),
      notNowButton: document.getElementById("newAltTextNotNow"),
      saveButton: document.getElementById("newAltTextSave"),
    },
    altTextSettingsDialog: {
      dialog: document.getElementById("altTextSettingsDialog"),
      createModelButton: document.getElementById("createModelButton"),
      aiModelSettings: document.getElementById("aiModelSettings"),
      learnMore: document.getElementById("altTextSettingsLearnMore"),
      deleteModelButton: document.getElementById("deleteModelButton"),
      downloadModelButton: document.getElementById("downloadModelButton"),
      showAltTextDialogButton: document.getElementById(
        "showAltTextDialogButton"
      ),
      altTextSettingsCloseButton: document.getElementById(
        "altTextSettingsCloseButton"
      ),
      closeButton: document.getElementById("altTextSettingsCloseButton"),
    },
    addSignatureDialog: {
      dialog: document.getElementById("addSignatureDialog"),
      panels: document.getElementById("addSignatureActionContainer"),
      typeButton: document.getElementById("addSignatureTypeButton"),
      typeInput: document.getElementById("addSignatureTypeInput"),
      drawButton: document.getElementById("addSignatureDrawButton"),
      drawSVG: document.getElementById("addSignatureDraw"),
      drawPlaceholder: document.getElementById("addSignatureDrawPlaceholder"),
      drawThickness: document.getElementById("addSignatureDrawThickness"),
      imageButton: document.getElementById("addSignatureImageButton"),
      imageSVG: document.getElementById("addSignatureImage"),
      imagePlaceholder: document.getElementById("addSignatureImagePlaceholder"),
      imagePicker: document.getElementById("addSignatureFilePicker"),
      imagePickerLink: document.getElementById("addSignatureImageBrowse"),
      description: document.getElementById("addSignatureDescription"),
      clearButton: document.getElementById("clearSignatureButton"),
      saveContainer: document.getElementById("addSignatureSaveContainer"),
      saveCheckbox: document.getElementById("addSignatureSaveCheckbox"),
      errorBar: document.getElementById("addSignatureError"),
      errorTitle: document.getElementById("addSignatureErrorTitle"),
      errorDescription: document.getElementById("addSignatureErrorDescription"),
      errorCloseButton: document.getElementById("addSignatureErrorCloseButton"),
      cancelButton: document.getElementById("addSignatureCancelButton"),
      addButton: document.getElementById("addSignatureAddButton"),
    },
    editSignatureDialog: {
      dialog: document.getElementById("editSignatureDescriptionDialog"),
      description: document.getElementById("editSignatureDescription"),
      editSignatureView: document.getElementById("editSignatureView"),
      cancelButton: document.getElementById("editSignatureCancelButton"),
      updateButton: document.getElementById("editSignatureUpdateButton"),
    },
    annotationEditorParams: {
      editorCommentsSidebar: document.getElementById("editorCommentsSidebar"),
      editorCommentsSidebarCount: document.getElementById(
        "editorCommentsSidebarCount"
      ),
      editorCommentsSidebarTitle: document.getElementById(
        "editorCommentsSidebarTitle"
      ),
      editorCommentsSidebarCloseButton: document.getElementById(
        "editorCommentsSidebarCloseButton"
      ),
      editorCommentsSidebarList: document.getElementById(
        "editorCommentsSidebarList"
      ),
      editorCommentsSidebarResizer: document.getElementById(
        "editorCommentsSidebarResizer"
      ),
      editorFreeTextFontSize: document.getElementById("editorFreeTextFontSize"),
      editorFreeTextColor: document.getElementById("editorFreeTextColor"),
      editorInkColor: document.getElementById("editorInkColor"),
      editorInkThickness: document.getElementById("editorInkThickness"),
      editorInkOpacity: document.getElementById("editorInkOpacity"),
      editorStampAddImage: document.getElementById("editorStampAddImage"),
      editorSignatureAddSignature: document.getElementById(
        "editorSignatureAddSignature"
      ),
      editorFreeHighlightThickness: document.getElementById(
        "editorFreeHighlightThickness"
      ),
      editorHighlightShowAll: document.getElementById("editorHighlightShowAll"),
    },
    printContainer: document.getElementById("printContainer"),
    editorUndoBar: {
      container: document.getElementById("editorUndoBar"),
      message: document.getElementById("editorUndoBarMessage"),
      undoButton: document.getElementById("editorUndoBarUndoButton"),
      closeButton: document.getElementById("editorUndoBarCloseButton"),
    },
    editCommentDialog: {
      dialog: document.getElementById("commentManagerDialog"),
      toolbar: document.getElementById("commentManagerToolbar"),
      title: document.getElementById("commentManagerTitle"),
      textInput: document.getElementById("commentManagerTextInput"),
      cancelButton: document.getElementById("commentManagerCancelButton"),
      saveButton: document.getElementById("commentManagerSaveButton"),
    },
  };
}

function webViewerLoad() {
  const config = getViewerConfiguration();

  if (typeof PDFJSDev !== "undefined" && PDFJSDev.test("GENERIC")) {
    // Give custom implementations of the default viewer a simpler way to
    // set various `AppOptions`, by dispatching an event once all viewer
    // files are loaded but *before* the viewer initialization has run.
    const event = new CustomEvent("webviewerloaded", {
      bubbles: true,
      cancelable: true,
      detail: {
        source: window,
      },
    });
    try {
      // Attempt to dispatch the event at the embedding `document`,
      // in order to support cases where the viewer is embedded in
      // a *dynamically* created <iframe> element.
      parent.document.dispatchEvent(event);
    } catch (ex) {
      // The viewer could be in e.g. a cross-origin <iframe> element,
      // fallback to dispatching the event at the current `document`.
      console.error("webviewerloaded:", ex);
      document.dispatchEvent(event);
    }
  }
  PDFViewerApplication.run(config);
}

function getViewer() {
  const eventBus = new EventBus();
  // (Optionally) enable hyperlinks within PDF files.
  const linkService = new PDFLinkService({ eventBus });
  // // (Optionally) enable scripting support.
  // const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
  //   eventBus,
  //   sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
  // });
  const pdfViewer = new PDFViewer({
    container: document.getElementById("viewerContainer")! as HTMLDivElement,
    viewer: document.getElementById("viewer")! as HTMLDivElement,
    eventBus,
    linkService,
    // (Optionally) enable find controller.
    findController: new PDFFindController({ eventBus, linkService }),
    //   annotationLayerFactory: new DefaultAnnotationLayerFactory(),
    // textLayerFactory: new DefaultTextLayerFactory(),
    removePageBorders: false,
    annotationEditorMode: AnnotationEditorType.NONE,
    annotationMode: AnnotationMode.ENABLE,
    annotationEditorHighlightColors:
      "yellow=#FFFF98,green=#53FFBC,blue=#80EBFF,pink=#FFCBE6,red=#FF4F5F,yellow_HCM=#FFFFCC,green_HCM=#53FFBC,blue_HCM=#80EBFF,pink_HCM=#F6B8FF,red_HCM=#C50043",
  });
  linkService.setViewer(pdfViewer);
  // new AnnotationEditorLayer({
  //   uiManager: new AnnotationEditorUIManager({}),
  //   div,
  //   mode,
  //   structTreeLayer
  // })

  let _annotationEditorManager: AnnotationEditorUIManager | null = null;
  pdfViewer.eventBus.on("annotationeditoruimanager", () => {
    _annotationEditorManager = (pdfViewer._layerProperties as LayerProperties)
      ?.annotationEditorUIManager;
  });
  const getAnnotationEditorUIManager = () => {
    return _annotationEditorManager as AnnotationEditorUIManager | null;
  };
  return {
    pdfViewer,
    linkService,
    eventBus,
    getAnnotationEditorUIManager,
  };
}

interface LayerProperties {
  annotationEditorUIManager: AnnotationEditorUIManager;
  annotationStorage: any;
  downloadManager: any;
  enableComment: any;
  enableScripting: any;
  fieldObjectsPromise: any;
  findController: any;
  hasJSActionsPromise: any;
  linkService: any;
}
