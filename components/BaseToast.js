import Toast from "react-bootstrap/Toast";

const BaseToast = ({ show, text, handleClose, className }) => {
  return (
    <div className={`base-toast ${className}`}>
      <Toast show={show} onClose={handleClose}>
        <Toast.Header>
          <strong className="mr-auto">{text}</strong>
        </Toast.Header>
      </Toast>
      <style jsx>{`
        .base-toast {
          position: fixed;
          top: 0;
          right: 50%;
          margin-top: 10px;
          margin-right: 10px;
        }
      `}</style>
    </div>
  );
};

export default BaseToast;
