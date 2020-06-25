const FileInput = ({ onChange, className = "" }) => {
  return (
    <div className={`form-group ${className}`}>
      <input type="file" className="form-control-file" onChange={onChange} />
    </div>
  );
};

export default FileInput;
