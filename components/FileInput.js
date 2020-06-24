const FileInput = ({ onChange, className }) => {
  console.log(className);
  return (
    <div className={`input-group mb-3 mt-4 ${className}`}>
      <div className="custom-file">
        <input id="file-upload" type="file" onChange={onChange} />
        <label className="custom-file-label" htmlFor="file-upload">
          Choose file
        </label>
      </div>
    </div>
  );
};

export default FileInput;
