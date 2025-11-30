# Nocturnote

Nocturnote is a sleek, modern, and highly customizable note-taking application built with Electron, Svelte, TypeScript, and Tailwind CSS. It offers a distraction-free writing environment with powerful features like search and replace, file management, and appearance customization.

## Features

- **Customizable Interface:** Choose your preferred font family, font size, font weight, and line height. Toggle word wrap and line numbers to suit your writing style.
- **File Management:** Easily create new notes, open existing `.txt` or `.md` files, and save your work.
- **Search and Replace:** Quickly find specific text within your notes and replace it with new content.
- **Notepad Mode:** Experience a classic notepad aesthetic with a toggleable "Notepad Mode."
- **Rain Mode:** A unique visual effect to enhance your writing experience.
- **Status Bar:** Keep track of your line and column position, character count, and file encoding (UTF-8).
- **Unsaved Changes Protection:** Never lose your work with built-in prompts for unsaved changes before closing or opening new files.
- **Cross-Platform:** Built with Electron, Nocturnote is designed to run seamlessly across different operating systems.

## Technologies Used

- **Electron:** For building cross-platform desktop applications.
- **Svelte:** A modern JavaScript framework for building user interfaces.
- **TypeScript:** For type-safe JavaScript development.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **electron-vite:** A fast development setup for Electron apps.

## Installation

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn (npm is used in the commands below)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/fezcode/nocturnote.git
    cd nocturnote
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

### Development

To run the application in development mode:

```bash
npm run dev
```

This will open the Electron application with live reloading for both main and renderer processes.

### Building

To build the application for production:

```bash
npm run build
```

This will create distributable packages for your operating system in the `out` directory.

You can also build for specific platforms:

- **Windows:** `npm run build:win`
- **macOS:** `npm run build:mac`
- **Linux:** `npm run build:linux`
- **Unpacked (for debugging):** `npm run build:unpack`

### Other Scripts

- `npm run format`: Format code with Prettier.
- `npm run lint`: Lint code with ESLint.
- `npm run typecheck`: Run TypeScript type checks.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information. (Note: Assuming MIT license as it's common. A `LICENSE` file should be added if not present.)

## Contact

Project Link: [https://github.com/fezcode/nocturnote](https://github.com/fezcode/nocturnote)
