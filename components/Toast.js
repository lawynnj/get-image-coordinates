import Toast from "react-bootstrap/Toast";

const BaseToast = ({ show, text, handleClose }) => {
  return (
    <div className="base-toast">
      <Toast show={show} onClose={handleClose}>
        <Toast.Header>
          <strong className="mr-auto">{text}</strong>
        </Toast.Header>
      </Toast>
      <style jsx>{`
        .base-toast {
          position: absolute;
          top: 0;
          right: 50%;
          margin-top: 10px;
          margin-right: 10px;
        }

        .toast-container {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default BaseToast;
