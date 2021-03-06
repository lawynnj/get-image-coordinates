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
  coordinateY: 10
}`;

const RenderEditorTip = () => {
  return (
    <>
      <h6>Formatting the copy</h6>
      <p>
        Change the format of the copied object in the text editor in step 2
        below.
      </p>
      <p>
        Please include the macros <b>#x</b> and <b>#y</b> if you change the
        format. They will be replaced by the <i> x</i> and
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
            <button
              className="close ml-auto"
              type="button"
              aria-label="Close"
              onClick={onClose}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="col-12">
            <h5>Steps</h5>
            <p>1. Upload an image and adjust the width.</p>
            <p>
              2. Click anywhere on the image to copy coordinates. Format the
              object that is copied in the <b>editor</b> in step 2 below.
            </p>
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
    <div className="border rounded p-4 inputs-ctr d-flex flex-column align-items-center d-md-block">
      <h5>1. Upload Image</h5>
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
            {scale ? "Undo" : "Adjust width (px)"}
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
        <span>Format:</span>
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
          backgroundColor: disabled ? "#fff" : "#ededed",
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
  const [showTip, setShowTip] = useState(false);
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
  const [pasteOutput, setPasteOutput] = useState("");
  const [toggleExample, setToggleExample] = useState(false);
  // clear timeout
  useEffect(() => {
    return () => {
      clearTimeout(notifTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let tmp = code;
    tmp = tmp.replace("#x", 100);
    tmp = tmp.replace("#y", 100);
    console.log(tmp);
    setPasteOutput(tmp);
  }, [code]);

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
        <div className="float-right">
          {showTip ? (
            <RenderTip onClose={() => setShowTip(false)} />
          ) : (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setShowTip(true)}
            >
              Show tip
            </button>
          )}
        </div>

        <h4>An easy way to get x and y coordinates of an image.</h4>

        <div className="row mt-4 mb-2">
          <div className="col-12">
            <RenderFileUpload
              width={form.width}
              scale={scale}
              toggleScale={toggleScale}
              handleUpload={handleUpload}
              handleChange={handleChange}
            />
          </div>
          <div className="col-12 mt-3">
            <div className="border rounded editor-container d-flex flex-column align-items-center d-md-block p-4">
              <h5>2. Editor - Change the copy and paste format</h5>
              <div className="d-flex flex-column flex-md-row flex-wrap">
                <div>
                  <p>Editor:</p>
                  <RenderEditor
                    value={code}
                    handleCodeChange={handleCodeChange}
                  />
                </div>
                <div className="">
                  <p>Copy and paste output:</p>
                  <RenderEditor value={pasteOutput} disabled={true} />
                </div>
              </div>
              <button
                className="btn btn-outline-primary btn-sm mt-4"
                onClick={() => setToggleExample((val) => !val)}
              >
                {toggleExample ? "Hide" : "See"} Example
              </button>
              {toggleExample && (
                <>
                  <h4 className="mt-1">Example</h4>
                  <RenderEditorExamples />
                </>
              )}
            </div>
          </div>
          <div className="col-12 mt-3">
            <div className="border rounded p-4">
              <h4>
                3. Click anywhere on the image to copy coordinates to the
                clipboard!
              </h4>
            </div>
          </div>
        </div>

        <hr />

        <canvas id="canvas" ref={canvasRef}></canvas>
        <div style={{ height: 90 }}></div>
        <div className="coordinate-footer">
          <Form.Group controlId="formBasicCheckbox">
            <Form.Check
              type="checkbox"
              label="Show colors"
              onChange={() => setForm({ ...form, showColor: !form.showColor })}
              checked={form.showColor}
            />
          </Form.Group>
          <div>
            <div className="d-flex w-50 ">
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
        </div>
      </main>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        .width-input {
          max-width: 250px;
        }
        .coordinate-footer {
          position: fixed;
          bottom: 0;
          background-color: white;
          width: 100%;
        }
        .toast-container {
          z-index: 999;
        }
      `}</style>
    </Layout>
  );
}
