import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import BaseToast from "../components/Toast";
export default function Home() {
  const canvasRef = useRef();
  const resultsRef = useRef();
  const [form, setForm] = useState({ width: 0 });
  const [scale, setScale] = useState(false);
  const [imgEl, setImgEl] = useState(null);
  const [showCopyNotif, setShowCopyNotif] = useState(false);
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
        const copyText = x + ";" + y;
        navigator.clipboard.writeText(copyText).then(
          () => {
            setShowCopyNotif(true);
            setTimeout(() => setShowCopyNotif(false), 2000);
          },
          () => {}
        );
      }

      current.addEventListener("mousemove", mousePos, false);
      current.addEventListener("click", handleClick, false);
    }
    return () => {};
  }, [canvasRef]);

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    if (imgEl) {
      if (scale) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        const sH = (imgEl.height / imgEl.width) * form.width;
        context.drawImage(imgEl, 0, 0, form.width, sH);
      } else {
        context.drawImage(imgEl, 0, 0);
      }
    }
  }, [canvasRef, scale, imgEl]);

  const handleUpload = (e) => {
    const url = URL.createObjectURL(e.target.files[0]);
    const img = new Image();
    const context = canvasRef.current.getContext("2d");
    img.src = url;
    setImgEl(img);
    img.onload = () => {
      canvasRef.current.width = img.width;
      canvasRef.current.height = img.height;

      if (scale === true) {
        const sH = (img.height / img.width) * form.width;
        context.drawImage(img, 0, 0, form.width, sH);
      } else {
        context.drawImage(img, 0, 0);
      }
    };
  };

  const toggleScale = () => {
    setScale(!scale);
  };

  const handleChange = (e) => {
    setForm({
      width: e.target.value,
    });
  };

  return (
    <div>
      <Head>
        <title>Get Coords</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container-fluid">
        <BaseToast show={showCopyNotif} text="Copied!" />
        <p>
          Open image: <input type="file" onChange={handleUpload} />
        </p>

        <div className="input-group mb-3 width-input">
          <div className="input-group-prepend">
            <button
              className={`btn ${scale ? "btn-info" : "btn-outline-secondary "}`}
              type="button"
              onClick={toggleScale}
            >
              {scale ? "Unscale" : "Scale"} image
            </button>
          </div>
          <input
            type="number"
            className="form-control "
            placeholder="Enter a width here"
            value={form.width}
            onChange={handleChange}
          />
        </div>
        <canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
        <div ref={resultsRef}>
          Move mouse over image to show mouse location and pixel value and alpha
        </div>
      </main>

      <style jsx>{`
        .canvas {
          margin: 12px;
        }

        .width-input {
          width: 300px;
        }

        footer {
          position: fixed;
          bottom: 0;
          left: 0;
          margin: 0 auto;
          background: #0072bb;
          color: #fff;
        }
      `}</style>

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
      `}</style>
    </div>
  );
}
