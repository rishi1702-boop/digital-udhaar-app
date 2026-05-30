const Loader = ({ fullPage }) => {
  return (
    <div className={fullPage ? 'loader-full' : 'loader-container'}>
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
