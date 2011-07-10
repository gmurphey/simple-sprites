var settings, CONSTANTS, defaults, spriteDocument, inputFolder, inputDocuments, currentDocument;

settings = {
	folderDialog: "Select a folder to process",
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

// save current preferences for later
app.preferences.rulerUnits = settings.preferences.rulerUnits;
app.preferences.typeUnits = TypeUnits.PIXELS;
app.displayDialogs = DialogModes.NO;

inputFolder = Folder.selectDialog(settings.folderDialog);

if (inputFolder === null) {
	throw CONSTANTS.EXCEPTIONS.NO_INPUT;
}

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
			spriteDocument.resizeCanvas((spriteDocument.width + currentDocument.width), ((spriteDocument.height >= currentDocument.height) ? spriteDocument.height : currentDocument.height), AnchorPosition.TOPLEFT);
		} else {
			spriteDocument = app.documents.add(currentDocument.width, currentDocument.height, settings.document.resolution, settings.document.name, settings.document.mode, settings.document.initialFill, settings.document.pixelAspectRatio);
		}

    	spriteDocument.selection.select([[(spriteDocument.width - currentDocument.width), 0], [spriteDocument.width, 0], [spriteDocument.width, currentDocument.height], [(spriteDocument.width - currentDocument.width), currentDocument.height]]);
		spriteDocument.paste(true);
		
		currentDocument.close(SaveOptions.DONOTSAVECHANGES);
	}
}

// reset default preferences
app.preferences.rulerUnits = defaults.rulerUnits;
app.preferences.typeUnits = defaults.typeUnits;
app.displayDialogs = defaults.displayDialogs;