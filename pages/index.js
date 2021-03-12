import { useState, useRef, useEffect } from "react";
import BaseToast from "../components/BaseToast";
import Layout from "../components/Layout";
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

const RenderEditorTip = () => {
  return (
    <>
      <h6>2. Formatting the copy</h6>
      <p>
        Update the text in the text field under the "Copy Format" section to
        update the format of the copied the co-ordinates
      </p>
      <p>
        When using your own format include the keys <b>#x</b> and <b>#y</b>{" "}
        which will be replaced by the <i> x</i> and
        <i> y</i> co-ordinates, respectively.
      </p>
      <RenderEditor
        value={initCode}
        handleCodeChange={() => ({})}
        disabled={true}
      />
    </>
  );
};

const RenderTip = ({ onClose }) => {
  return (
    <div className="alert border">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex">
              <h4 className="d-inline">Tip</h4>
              <button
                className="close ml-auto"
                type="button"
                aria-label="Close"
                onClick={onClose}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>
          <div className="col-12">
            <p>
              Get Image Coordinates is a tool that allows you to get x and y
              co-ordinates of an image by using your mouse. Simply upload an
              image, adjust the width by adding a scale (optional), and click on
              a point to copy co-ordinates. You can format how the co-ordinates
              are copied in the editor.
            </p>
          </div>
          <div className="col-12">
            <h6>1. Upload an image</h6>
          </div>
          <div className="col-12 mt-3">
            <RenderEditorTip />
          </div>
          <div className="col-12 mt-3">
            <RenderEditorExamples />
          </div>
          <div className="col-12 mt-3">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={onClose}
            >
              Hide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RenderFileUpload = ({
  handleUpload,
  handleChange,
  toggleScale,
  scale,
  width,
}) => {
  return (
    <div className="border rounded p-2 inputs-ctr d-flex flex-column align-items-center d-md-block">
      <h4>Upload Image</h4>
      <input
        type="file"
        onChange={handleUpload}
        accept="image/*"
        className="my-2 width-input"
      />

      <div className="input-group mt-2 width-input">
        <input
          type="number"
          className="form-control"
          value={width}
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
      <style jsx>{`
        .inputs-ctr {
          min-width: 350px;
        }
      `}</style>
    </div>
  );
};

const RenderEditorExamples = () => {
  return (
    <div className="d-flex flex-column flex-md-row flex-wrap">
      <div>
        <span>Example Format:</span>
        <RenderEditor value={exampleFormat} disabled={true} />
      </div>
      <div className="mt-4 mt-md-0">
        <span>Output:</span>
        <RenderEditor value={exampleFormat2} disabled={true} />
      </div>
    </div>
  );
};

const RenderEditor = ({ disabled = false, value, handleCodeChange }) => {
  return (
    <>
      <Editor
        disabled={disabled}
        value={value}
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

      <style jsx>
        {`
          .editor-container {
            z-index: 1;
          }
        `}
      </style>
    </>
  );
};

export default function Home() {
  const canvasRef = useRef();
  const notifTimeoutRef = useRef(false);

  const [form, setForm] = useState({ width: 0, showColor: true });
  const [scale, setScale] = useState(false);
  const [imgEl, setImgEl] = useState(null);
  const [showTip, setShowTip] = useState(true);
  const [showCopyNotif, setShowCopyNotif] = useState(false);
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

  return (
    <Layout title="Home">
      <main className="container-fluid pt-4">
        <BaseToast
          show={showCopyNotif}
          text="Copied!"
          handleClose={handleCloseNotif}
          className="toast-container"
        />
        {showTip ? (
          <RenderTip onClose={() => setShowTip(false)} />
        ) : (
          <button
            className="float-right btn btn-outline-primary btn-sm"
            onClick={() => setShowTip(true)}
          >
            Show tip
          </button>
        )}

        <h3>Get Image Coordinates</h3>
        <div className="row mt-4 mb-2">
          <div className="col-12 col-md-6">
            <RenderFileUpload
              width={form.width}
              scale={scale}
              toggleScale={toggleScale}
              handleUpload={handleUpload}
              handleChange={handleChange}
            />
          </div>
          <div className="col-12 col-md-6">
            <div className="border rounded p-2 editor-container d-flex flex-column align-items-center d-md-block px-4">
              <h4>Copy Format</h4>
              <RenderEditor value={code} handleCodeChange={handleCodeChange} />
            </div>
          </div>
        </div>
        <p className="mt-4">Click anywhere on the image to copy coordinates!</p>
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
          max-width: 250px;
        }

        .toast-container {
          z-index: 999;
        }
      `}</style>
    </Layout>
  );
}
