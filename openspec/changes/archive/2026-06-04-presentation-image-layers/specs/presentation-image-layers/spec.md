## ADDED Requirements

### Requirement: Admin can insert an image element on canvas
The system SHALL allow an officer to insert an image element onto the presentation canvas. The image element MUST be uploaded from the local computer and MUST appear on the canvas at a default position and size after upload.

#### Scenario: Inserting an image element
- **WHEN** an officer clicks "插入圖片" in the canvas editor
- **THEN** the system MUST open a file picker, upload the selected image, and create a new image layer at the center of the canvas with default dimensions (width: 480, height: 360)

##### Example:
- **GIVEN** the canvas is active and the officer clicks "插入圖片"
- **WHEN** the officer selects "product-photo.jpg" from their computer
- **THEN** an image layer appears at x=720, y=360 with width=480, height=360, displaying the uploaded image

### Requirement: Image element supports drag and resize
The system SHALL allow an officer to drag an image element to reposition it and resize it by dragging a handle. The image element MUST use the same interaction model as text layers.

#### Scenario: Dragging an image element
- **WHEN** an officer clicks and drags an image element
- **THEN** the image element MUST move to the new position while staying within the 1920x1080 canvas boundaries

#### Scenario: Resizing an image element
- **WHEN** an officer drags the resize handle of an image element
- **THEN** the image element MUST change its width and height while maintaining the resize within canvas boundaries

### Requirement: Image element has style controls in property panel
The system SHALL expose style controls for image elements in the property panel, including border radius, shadow, and object-fit toggle.

#### Scenario: Changing image border radius
- **WHEN** an officer selects an image element and changes the border radius to 16px
- **THEN** the image element MUST render with 16px rounded corners in both the editor and the public viewer

#### Scenario: Changing image object-fit
- **WHEN** an officer toggles object-fit from "cover" to "contain"
- **THEN** the image MUST display fully within the element frame, potentially showing empty space, rather than cropping to fill

### Requirement: Text layer supports inline image block
The system SHALL allow an officer to insert an image block inside a text layer. The image MUST occupy its own line (block-level) within the text flow.

#### Scenario: Inserting an image into text layer
- **WHEN** an officer clicks "插入圖片" while editing a text layer
- **THEN** the system MUST insert a markdown-like image marker `![description](url)` at the cursor position in the textarea

##### Example:
- **GIVEN** a text layer contains "產品介紹：\n我們的核心產品是..."
- **WHEN** the officer clicks "插入圖片" and selects "product.jpg"
- **THEN** the textarea shows "產品介紹：\n![產品圖](https://cdn.example.com/product.jpg)\n我們的核心產品是..."

#### Scenario: Replacing an inline image in text layer
- **GIVEN** a text layer textarea contains `![舊圖](https://cdn.example.com/old.jpg)`
- **WHEN** an officer manually edits the marker URL in the textarea to point to a new image
- **THEN** the viewer MUST render the updated image on the next save and reload

### Requirement: Viewer renders image elements and inline images
The system SHALL render image elements and inline image blocks in the public presentation viewer. Image elements MUST use the stored position, size, and style. Inline images MUST display as block-level images within text layers.

#### Scenario: Viewer renders image element
- **WHEN** the viewer renders a slide with an image element
- **THEN** the image MUST appear at the specified x, y position with the specified width, height, border radius, shadow, and object-fit

#### Scenario: Viewer renders inline image in text layer
- **WHEN** the viewer renders a text layer containing `![描述](url)`
- **THEN** the text MUST display the image as a block-level element between the surrounding text

### Requirement: Image upload validates file type and size
The system MUST validate that uploaded image files are valid images (JPEG, PNG, WebP) and MUST reject files exceeding 5MB.

#### Scenario: Uploading an invalid file type
- **WHEN** an officer attempts to upload a PDF file as an image layer
- **THEN** the system MUST reject the upload with an error message indicating only image files are accepted

#### Scenario: Uploading an oversized image
- **WHEN** an officer attempts to upload a 10MB image
- **THEN** the system MUST reject the upload with an error message indicating the 5MB size limit
