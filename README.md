# MediaConverter

![MediaConverter Logo](./static/favicon.svg)

**MediaConverter** is a straightforward and simple-to-use media conversion website that runs locally on your device. Leveraging the power of the `ffmpeg.wasm` library, MediaConverter ensures enhanced privacy and security by processing all conversions directly in your browser without uploading your files to any external servers.

## Features

- **Local Processing**: All media conversions are handled locally in your browser, ensuring your files remain private and secure.
- **Supports Multiple Formats**: Convert between video and image formats with ease.
- **Batch Conversion**: Convert multiple files in parallel to save time.
- **Advanced Settings**: Adjust resolution, bitrate, and codec settings for your media files.
- **Modern UI**: A clean and intuitive interface built with SvelteKit for a seamless user experience.
- **Performance Optimized**: Utilizes `ffmpeg.wasm` for efficient media processing directly in the browser.

## Getting Started

Follow these instructions to set up and run MediaConverter on your local machine.

### Prerequisites

- **[Bun](https://bun.sh/)**: Ensure you have Bun installed on your system. If not, you can install it by following the instructions on the [official Bun website](https://bun.sh/).
- To use npm instead of bun, replace `bun` with `npm` in the commands.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/rcb123/MediaConverter.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd MediaConverter
   ```

3. **Install Dependencies**

   Use Bun to install the necessary packages:

   ```bash
   bun install
   ```

### Running the Development Server

To start the development server and begin working on the project:

```bash
bun run dev
```

- Open your browser and navigate to `http://localhost:5173` (or the port specified in your terminal) to view the application.
- The development server supports hot module replacement, so any changes you make to the code will automatically reflect in the browser.

### Building for Production

To create an optimized production build of MediaConverter:

```bash
bun build
```

- This command compiles the application, optimizing it for performance and preparing it for deployment.

### Previewing the Production Build

After building the project, you can preview the production build locally:

```bash
bun run preview
```

- Navigate to `http://localhost:4173` (or the port specified in your terminal) to see the production version of the application.

## Project Structure

```
MediaConverter/
├── src/
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   └── utils.ts (shadcn utils)
│   ├── lib/
│   │   ├── ffmpeg.ts
│   │   └──
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   └── +page.ts
│   ├── app.css
│   ├── app.d.ts
│   └── app.html
├── static/
│   ├── favicon.svg
│   └── robots.txt
├── .gititgnore
├── .npmrc
├── .prettierignore
├── .prettierrc
├── bun.lockb
├── components.json
├── eslint.config.js
├── LICENSE.md
├── package.json
├── postcss.config.js
├── README.md
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Usage

1. **Select a File**

   - Drag and drop a media file or click to upload from your device.

2. **Choose Conversion Settings**

   - Select the desired format from the dropdown.
   - (Optional) Adjust resolution, bitrate, and codec settings for videos.

3. **Convert**

   - Click the **Convert** button to start the conversion process.
   - Once completed, download the converted file directly from the browser.

4. **Batch Conversion**

   - Toggle to batch mode to convert multiple files at once.
   - After conversion, download all files as a single ZIP archive.

## Contributing

Contributions are welcome! If you have suggestions, bug reports, or improvements, feel free to open an issue or submit a pull request.

1. **Fork the Repository**

2. **Create a New Branch**

   ```bash
   git checkout -b feature/YourFeatureName develop
   ```

3. **Make Your Changes**

4. **Commit Your Changes**

   ```bash
   git commit -m "Add your message"
   ```

5. **Push to Your Fork**

   ```bash
   git push origin feature/YourFeatureName
   ```

6. **Open a Pull Request**

## License

This project is licensed under the [GNU General Public License v3.0](./LICENSE).

---

_MediaConverter_ is designed with simplicity and user privacy in mind. Enjoy seamless media conversions without the hassle!
