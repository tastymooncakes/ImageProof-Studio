# ImageProof Studio

![ImageProof Studio](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Professional image verification and annotation tool with ProofSnap evidence integration.**

ImageProof Studio helps investigators analyze suspicious AI-generated images by providing an intuitive annotation interface and generating comprehensive verification reports with cryptographic evidence from Numbers Protocol.

## 🎯 Features

- **Interactive Annotation** - Click to place numbered markers on suspicious areas
- **Comment System** - Add detailed observations for each finding
- **ProofSnap Integration** - Attach cryptographic evidence from Numbers Protocol
- **Professional Reports** - Generate PDF reports with annotated images and findings
- **Local Storage** - All annotations persist in browser localStorage
- **Clean UI** - Modern, professional interface built with Tailwind CSS

## 🚀 Demo

Built for hackathons to help combat AI-generated misinformation and deepfakes.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Canvas**: React Konva
- **PDF Generation**: jsPDF
- **Icons**: Lucide React
- **State Management**: React Hooks + localStorage

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/tastymooncakes/ImageProof-Studio.git
cd ImageProof-Studio

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Numbers Protocol API Token

1. Install the [ProofSnap Chrome Extension](https://chromewebstore.google.com/detail/proofsnap/pmofaiaefjjnfphfdhjaeogelolnikho)
2. Get your capture token from the extension settings
3. Add it in **Settings** within ImageProof Studio
4. Now you can attach cryptographic evidence to your annotations

## 📖 Usage

1. **Select an Image** - Choose from pre-loaded AI-generated images
2. **Add Annotations** - Click on suspicious areas to place markers
3. **Add Comments** - Describe what looks unnatural or manipulated
4. **Attach Evidence** - Link ProofSnap captures as cryptographic proof
5. **Generate Report** - Export a professional PDF with all findings

## 🎨 Screenshots

### Annotation Interface

Professional canvas-based annotation system with numbered markers.

### PDF Report

Comprehensive verification reports with metadata, statistics, and evidence links.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created by [@tastymooncakes](https://github.com/tastymooncakes)

---

**⭐ If you find this project useful, please consider giving it a star!**
