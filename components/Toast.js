import Toast from "react-bootstrap/Toast";

const BaseToast = ({ show, text }) => {
  return (
    <div className="base-toast">
      <Toast show={show}>
        <Toast.Header>
          <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
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
