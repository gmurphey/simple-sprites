function simpleSprites() {
  var settings, CONSTANTS, defaults, dialogLayout, dlg, margin, spriteDocument, inputFolder, inputDocuments, currentDocument, bounds;

  settings = {
    folderDialog: "Select a folder to process",
    optionsDialog: {
      title: "Simple Sprites Options",
      errors: {
        marginNaN: "Margin is not a number."
      }
    },
    fileFilter: "*",
    document: {
      resolution: 72,
      name: "Sprites",
      mode: NewDocumentMode.RGB,
      initialFill: DocumentFill.TRANSPARENT,
      pixelAspectRatio: 1
    },
    preferences: {
      rulerUnits: Units.PIXELS,
      typeUnits: TypeUnits.PIXELS,
      displayDialogs: DialogModes.NO
    }
  };

  CONSTANTS = {
    EXCEPTIONS: {
      NO_INPUT: 'noInput',
      BAD_DOC: 'badDoc'
    }
  };

  defaults = {
    rulerUnits: app.preferences.rulerUnits,
    typeUnits: app.preferences.typeUnits,
    displayDialogs: app.displayDialogs
  };

  dialogLayout = "dialog { " +
    "marginGroup: Group { orientation: 'row', alignChildren: 'right', " +
      "marginLabel: StaticText { text: 'Margin:' }, " +
      "marginText: EditText { text: '0', characters: 5 } " +
    "}, " +
    "orientationPanel: Panel { orientation: 'row', alignChildren: 'left', text: 'Sprite Orientation', " +
      "horizontalRadio: RadioButton { text: 'Horizontal', value: true }, " +
      "verticalRadio: RadioButton { text: 'Vertical', value: false }" +
    "}, " +
    "buttonGroup: Group { orientation: 'row', alignChildren: 'right', " +
      "okButton: Button { text: 'Ok', properties: { name: 'ok' } }, " +
      "cancelButton: Button { text: 'Cancel', properties: { name: 'cancel'} }" +
    "}" + 
  "}";

  // save current preferences for later
  app.preferences.rulerUnits = settings.preferences.rulerUnits;
  app.preferences.typeUnits = TypeUnits.PIXELS;
  app.displayDialogs = DialogModes.NO;

  inputFolder = Folder.selectDialog(settings.folderDialog);

  if (inputFolder === null) {
    throw CONSTANTS.EXCEPTIONS.NO_INPUT;
  }

  dlg = new Window(dialogLayout, settings.optionsDialog.title);

  dlg.buttonGroup.okButton.onClick = function () {
    if (isNaN(this.window.marginGroup.marginText.text)) {
      alert(settings.optionsDialog.errors.marginNaN);
      return false;
    } else {
      dlg.close(1);
    }
  }

  dlg.center();

  if (dlg.show() === 1) {
    margin = parseInt(dlg.marginGroup.marginText.text);
    orientation = (dlg.orientationPanel.horizontalRadio.value) ? 'horizontal' : 'vertical';
    
    inputDocuments = inputFolder.getFiles(settings.fileFilter);

    for (var i = 0; i < inputDocuments.length; i++) {
      if ((inputDocuments[i] instanceof File) && (!inputDocuments[i].hidden)) {
        currentDocument = open(inputDocuments[i]);

        if (currentDocument === null) {
          throw CONSTANTS.EXCEPTIONS.BAD_DOC;
        }

        try {
          currentDocument.mergeVisibleLayers();
        } catch (e) {}
      
        currentDocument.selection.selectAll();
        currentDocument.selection.copy();

        // if sprite document doesn't exist, create it. If already existing, resize canvas to accomadate current document
        if (typeof(spriteDocument) != 'undefined') {
          app.activeDocument = spriteDocument;
          
          if (orientation === 'vertical') {
            spriteDocument.resizeCanvas(
              ((spriteDocument.width >= currentDocument.width) ? spriteDocument.width : currentDocument.width),
              (spriteDocument.height + currentDocument.height + margin),  
              AnchorPosition.TOPLEFT
            );
          } else {
            spriteDocument.resizeCanvas(
              (spriteDocument.width + currentDocument.width + margin), 
              ((spriteDocument.height >= currentDocument.height) ? spriteDocument.height : currentDocument.height), 
              AnchorPosition.TOPLEFT
            );
          }
        } else {
          spriteDocument = app.documents.add(
            currentDocument.width, 
            currentDocument.height, 
            settings.document.resolution, 
            settings.document.name, 
            settings.document.mode, 
            settings.document.initialFill, 
            settings.document.pixelAspectRatio
          );
        }

        if (orientation === 'vertical') {
            bounds = [
            [0, (spriteDocument.height - currentDocument.height)],
            [spriteDocument.width, (spriteDocument.height - currentDocument.height)], 
            [spriteDocument.width, spriteDocument.height], 
            [0, spriteDocument.height]
          ];
        } else {
          bounds = [
            [(spriteDocument.width - currentDocument.width), 0], 
            [spriteDocument.width, 0], 
            [spriteDocument.width, currentDocument.height], 
            [(spriteDocument.width - currentDocument.width), currentDocument.height]
          ];
        } 
        
        spriteDocument.selection.select(bounds);
        spriteDocument.paste(true);
      
        currentDocument.close(SaveOptions.DONOTSAVECHANGES);
      }
    }
  }

  // reset default preferences
  app.preferences.rulerUnits = defaults.rulerUnits;
  app.preferences.typeUnits = defaults.typeUnits;
  app.displayDialogs = defaults.displayDialogs;
}

simpleSprites();
