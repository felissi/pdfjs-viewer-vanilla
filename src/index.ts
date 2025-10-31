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
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

import { PDFDocument, rgb } from "pdf-lib";

import "pdfjs-dist/build/pdf.mjs";
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
    url: "/compressed.tracemonkey-pldi-09.pdf",
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
  document.getElementById("redo")!.addEventListener("click", () => {
    const manager = getAnnotationEditorUIManager();
    if (manager) {
      // manager.editor
      pdfViewer.annotationEditorMode = {
        mode: AnnotationEditorType.DISABLE,
      };
    }
  });

  document.getElementById("save")!.addEventListener(
    "click",
    () => {
      pdf.saveDocument().then((_) => {
        const blob = new Blob([_], { type: "application/pdf" });
        const a = document.createElement("a");
        const link = URL.createObjectURL(blob);
        a.href = link;
        a.download = "test.pdf";
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(blob);
          a.remove();
        });
      });
    },
    { passive: true }
  );

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
    // annotationEditorMode: AnnotationEditorType.HIGHLIGHT,
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
