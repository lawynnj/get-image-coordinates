import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import BaseToast from "../components/Toast";
import FileInput from "../components/FileInput";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";

const initCode = `[#x, #y]`;

export default function Home() {
  const canvasRef = useRef();
  const resultsRef = useRef();
  const notifTimeoutRef = useRef(false);

  const [form, setForm] = useState({ width: 0 });
  const [scale, setScale] = useState(false);
  const [imgEl, setImgEl] = useState(null);
  const [showCopyNotif, setShowCopyNotif] = useState(false);
  const [file, setFile] = useState(null);

  const [code, setCode] = useState(initCode);
  // clear timeout
  useEffect(() => {
    return () => {
      clearTimeout(notifTimeoutRef.current);
    };
  }, []);

  // initialize canvas events
  useEffect(() => {
    if (canvasRef) {
      const { current } = canvasRef;
      const context = canvasRef.current.getContext("2d");

      const mousePos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = parseInt(e.clientX - rect.left);
        const y = parseInt(e.clientY - rect.top);
        var p = context.getImageData(x, y, 1, 1).data;
        resultsRef.current.innerHTML =
          '<table style="width:100%;table-layout:fixed"><td>X: ' +
          x +
          "</td><td>Y: " +
          y +
          "</td><td>Red: " +
          p[0] +
          "</td><td>Green: " +
          p[1] +
          "</td><td>Blue: " +
          p[2] +
          "</td><td>Alpha: " +
          p[3] +
          "</td></table>";
        return { x, y };
      };

      // copy mouse positions
      function handleClick(e) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = parseInt(e.clientX - rect.left);
        const y = parseInt(e.clientY - rect.top);

        let cpTxt = code.replace("#x", x);
        cpTxt = cpTxt.replace("#y", y);

        clearTimeout(notifTimeoutRef.current);
        navigator.clipboard.writeText(cpTxt).then(
          () => {
            setShowCopyNotif(true);
            notifTimeoutRef.current = setTimeout(
              () => setShowCopyNotif(false),
              3000
            );
          },
          () => {}
        );
      }

      current.addEventListener("mousemove", mousePos, false);
      current.addEventListener("click", handleClick, false);
    }
    return () => {};
  }, [canvasRef, code]);

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    if (imgEl) {
      if (scale) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        const sH = (imgEl.height / imgEl.width) * form.width;
        canvasRef.current.width = form.width;
        canvasRef.current.height = sH;
        context.drawImage(imgEl, 0, 0, form.width, sH);
      } else {
        draw(imgEl, context, imgEl.width, imgEl.height);
      }
    }
  }, [canvasRef, scale, imgEl]);

  const draw = (img, context, w, h, sw = null, sh = null) => {
    canvasRef.current.width = w;
    canvasRef.current.height = h;
    if (sw !== null && sh !== null) {
      context.drawImage(img, 0, 0, sw, sh);
    } else {
      context.drawImage(img, 0, 0);
    }
  };

  const handleUpload = (e) => {
    try {
      setFile(e.target.files[0]);
      const url = URL.createObjectURL(e.target.files[0]);
      const img = new Image();
      const context = canvasRef.current.getContext("2d");
      img.src = url;
      setImgEl(img);
      img.onload = () => {
        if (scale === true) {
          const sH = (img.height / img.width) * form.width;
          draw(img, context, img.width, img.height, form.width, sH);
        } else {
          draw(img, context, img.width, img.height);
        }
      };
    } catch (error) {}
  };

  const toggleScale = () => {
    setScale(!scale);
  };

  const handleChange = (e) => {
    setForm({
      width: e.target.value,
    });
  };

  const handleCodeChange = (code) => {
    setCode(code);
  };

  const handleCloseNotif = () => {
    setShowCopyNotif(false);
    clearTimeout(notifTimeoutRef.current);
  };

  const renderInputs = () => {
    return (
      <div>
        <div className="d-flex">
          <FileInput
            onChange={handleUpload}
            className="mt-4  mb-2 width-input"
          />
          <div className="d-flex align-items-center ml-3"></div>
        </div>
        <span>{file ? `Filename: ${file.name}` : ""}</span>

        <div className="input-group mt-2 width-input">
          <div className="input-group-prepend">
            <button
              className={`btn ${
                !scale && form.width ? "btn-info" : "btn-outline-secondary "
              }`}
              type="button"
              onClick={toggleScale}
              disabled={!imgEl || !form.width}
            >
              {scale ? "Undo scale" : "Scale by width (px)"}
            </button>
          </div>
          <input
            type="number"
            className="form-control"
            value={form.width}
            onChange={handleChange}
            disabled={!imgEl}
          />
        </div>
        {imgEl && (
          <p className="mt-4">Click anywhere on the image copy coordinates!</p>
        )}
      </div>
    );
  };

  const renderEditor = () => {
    return (
      <div className="editor-container mt-4">
        <p>Format the copied co-ordinates!</p>
        <p>
          Simply include the macros <b>#x</b> and <b>#y</b> which will be
          substituted by the <i> x</i> and
          <i> y</i> co-ordinates, respectively
        </p>
        <Editor
          value={code}
          className="editor"
          onValueChange={handleCodeChange}
          highlight={(code) => highlight(code, languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
            backgroundColor: "#ededed",
            width: 250,
          }}
        />
        <style jsx>
          {`
            .editor-container {
              margin-left: 50px;
            }
          `}
        </style>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Get Coords</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container-fluid">
        <BaseToast
          show={showCopyNotif}
          text="Copied!"
          handleClose={handleCloseNotif}
        />
        <div className="d-flex">
          {renderInputs()}
          {renderEditor()}
        </div>

        <canvas id="canvas" ref={canvasRef}></canvas>
        <div ref={resultsRef}>
          Move mouse over image to show mouse location and pixel value and alpha
        </div>
      </main>
      <style jsx global>{`
        html,
        body {
          height: 100%;
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
        .width-input {
          width: 300px;
        }
      `}</style>
    </div>
  );
}
