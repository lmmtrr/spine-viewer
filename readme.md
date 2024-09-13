# Spine Viewer

## Usage

#### 1. Download

Use the **Code** > **Download ZIP** option on this page.
Then, unzip the '.zip' file and move to the extracted folder.

#### 2. Setup

After putting folders with spine files inside the **assets** folder, move to the **py** folder and then execute the following:

```sh
python setup.py
```

#### 3. Run

Move to the folder containing the **index.html** and then execute the following:

```sh
python -m http.server
```

#### 4. Visit http://localhost:8000/

## Keyboard shortcuts

| Keyboard shortcut            | Description    |
| ---------------------------- | -------------- |
| <kbd>Ctrl</kbd>+<kbd>S</kbd> | Next Scene     |
| <kbd>Ctrl</kbd>+<kbd>A</kbd> | Next Animation |
| <kbd>Ctrl</kbd>+<kbd>E</kbd> | Export         |

## NOTE:

If images are displayed in a fragmented manner, execute the following command. Note that the target images will be overwritten, so make a backup if necessary.

```sh
python resize.py
```

If a display bug like the one at the link occurs, please place the affected image into the **convert** folder and execute the following. Note that the target images will be overwritten, so it is recommended to back them up.

[Premultiplied Alpha Guide - Spine Forum](https://es.esotericsoftware.com/forum/d/3132-premultiplied-alpha-guide)

```sh
python pma2sta.py
```

or

```sh
python sta2pma.py
```
