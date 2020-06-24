const FileInput = ({ onChange, className }) => {
  return (
    <div className={`input-group ${className}`}>
      <div className="custom-file">
        <input id="file-upload" type="file" onChange={onChange} />
        <label className="custom-file-label" htmlFor="file-upload">
          Choose file
        </label>
      </div>
      <style jsx>{`
        .custom-file-upload {
          border: 1px solid #ccc;
          display: inline-block;
          padding: 6px 12px;
          cursor: pointer;
        }

        .custom-file-label {
          cursor: pointer;
        }

        input[type="file"] {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default FileInput;
