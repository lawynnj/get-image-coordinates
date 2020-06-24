import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import BaseToast from "../components/BaseToast";
import FileInput from "../components/FileInput";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import Form from "react-bootstrap/Form";
const initCode = `[#x, #y]`;
const exampleFormat = `{
  coordinateX: #x,
  coordinateY: #y
}`;

const exampleFormat2 = `{
  coordinateX: 3,
  coordinateY: 5
}`;

export default function Home() {
  const canvasRef = useRef();
  const notifTimeoutRef = useRef(false);

  const [form, setForm] = useState({ width: 0, showColor: true });
  const [scale, setScale] = useState(false);
  const [imgEl, setImgEl] = useState(null);
  const [showTip, setShowTip] = useState(true);
  const [showCopyNotif, setShowCopyNotif] = useState(false);
  const [file, setFile] = useState(null);
  const [data, setData] = useState({
    x: 0,
    y: 0,
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  });
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
        const p = context.getImageData(x, y, 1, 1).data;
        setData({
          x,
          y,
          r: p[0],
          g: p[1],
          b: p[2],
          a: p[3],
        });
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
    if (sw !== null && sh !== null) {
      canvasRef.current.width = sw;
      canvasRef.current.height = sh;
      context.drawImage(img, 0, 0, sw, sh);
    } else {
      canvasRef.current.width = w;
      canvasRef.current.height = h;
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
          context.clearRect(0, 0, context.canvas.width, context.canvas.height);
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
      ...form,
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

  const renderTip = () => {
    if (showTip) {
      return (
        <div className="alert alert-light border">
          <p>
            Get image coordinates is a tool that allows you to get x and y
            co-ordinates of an image by using your mouse. Simply upload an
            image, adjust the width by adding a scale (optional), and click on a
            point to copy co-ordinates. You can format how the co-ordinates are
            copied in the editor.
          </p>
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowTip(false)}
          >
            {" "}
            Hide{" "}
          </button>
        </div>
      );
    }

    return null;
  };

  const renderInputs = () => {
    return (
      <div>
        <div className="d-flex">
          <FileInput
            onChange={handleUpload}
            className="mt-4 mb-2 width-input"
          />
          <div className="d-flex align-items-center ml-3"></div>
        </div>
        <span>{file ? `Filename: ${file.name}` : ""}</span>

        <div className="input-group mt-2 width-input">
          <input
            type="number"
            className="form-control"
            value={form.width}
            onChange={handleChange}
          />
          <div className="input-group-prepend">
            <button
              className="btn btn-primary"
              type="button"
              onClick={toggleScale}
            >
              {scale ? "Undo scale" : "Scale by width (px)"}
            </button>
          </div>
        </div>
        <p className="mt-4">Click anywhere on the image to copy coordinates!</p>
      </div>
    );
  };

  const renderEditor = () => {
    return (
      <div className="editor-container mt-4">
        <div className="d-flex">
          <div className="mr-2 px-4">
            <h4>Format the copy</h4>
            <p>
              Update the text in the gray text field to update the format of the
              copied the co-ordinates
            </p>
            <p>
              When using your own format include the keys <b>#x</b> and{" "}
              <b>#y</b>. They will be replaced by the <i> x</i> and
              <i> y</i> co-ordinates, respectively.
            </p>
            <Editor
              value={code}
              onValueChange={handleCodeChange}
              highlight={(code) => highlight(code, languages.js)}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                backgroundColor: "#ededed",
                width: 250,
                marginRight: 10,
              }}
            />
          </div>
          <div className="px-4">
            <h4>Copy format example</h4>
            <div className="d-flex">
              <div>
                <span>Format input: </span>
                <Editor
                  value={exampleFormat}
                  highlight={(code) => highlight(code, languages.js)}
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                    backgroundColor: "#ededed",
                    width: 250,
                    marginRight: 10,
                  }}
                  disabled
                />
              </div>
              <div>
                <span>Copy Output:</span>
                <Editor
                  value={exampleFormat2}
                  highlight={(code) => highlight(code, languages.js)}
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                    backgroundColor: "#ededed",
                    width: 250,
                  }}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        <style jsx>
          {`
            .editor-container {
              margin-left: 50px;
              z-index: 1;
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
      <main className="container-fluid pt-4">
        <BaseToast
          show={showCopyNotif}
          text="Copied!"
          handleClose={handleCloseNotif}
          className="toast-container"
        />
        {renderTip()}
        <div className="d-flex mb-2">
          {renderInputs()}
          {renderEditor()}
        </div>
        <hr />
        <canvas id="canvas" ref={canvasRef}></canvas>
        <Form.Group controlId="formBasicCheckbox">
          <Form.Check
            type="checkbox"
            label="Show colors"
            onChange={() => setForm({ ...form, showColor: !form.showColor })}
            checked={form.showColor}
          />
        </Form.Group>
        <div>
          <div className="d-flex w-50">
            <div>X: {data.x} </div>
            <div className="ml-4">Y: {data.y} </div>
            {form.showColor && (
              <>
                <div className="ml-4">Red: {data.r} </div>
                <div className="ml-4">Green: {data.g} </div>
                <div className="ml-4">Blue: {data.b} </div>
                <div className="ml-4">Alpha: {data.a} </div>
              </>
            )}
          </div>
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

        .toast-container {
          z-index: 999;
        }
      `}</style>
    </div>
  );
}
