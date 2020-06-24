const FileInput = ({ onChange, className }) => {
  return (
    <div className={`input-group ${className}`}>
      <div class="form-group">
        <input type="file" class="form-control-file" onChange={onChange} />
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
