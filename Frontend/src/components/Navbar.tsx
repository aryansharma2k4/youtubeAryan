import hamburgIcon from "../assets/hamburg.png";
import logo from "../assets/logo.png";
import searchButton from "../assets/magnifyingGlass.png";

function Navbar() {
  return (
    <div className="flex items-center justify-between px-4 py-2 mt-2 border-gray-400 shadow-md">
      {/* Left Section */}
      <div className="flex items-center space-x-4 ">
        <button>
          <img src={hamburgIcon} alt="Menu Open Button" className="h-6 sm:h-8" />
        </button>
        <div className="mr-4 sm:h-6 w-24 mb-2">
          <img src={logo} alt="YouTube logo" className="h-6 sm:h-8" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex ml-6 items-center w-full sm:w-auto mt-2 sm:mt-0 ">
        <input
          type="text"
          className="bg-[#ECEBDE] shadow-md w-[140px] sm:w-[260px] lg:w-[400px] h-10 rounded-l-full pl-4"
          placeholder="Search"
        />
        <div className="bg-[#F5EFFF] w-10 h-10 rounded-r-full flex justify-center items-center border-gray-300 border-l-2">
          <img src={searchButton} alt="Search" className="h-6" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6 sm:space-x-12 sm:mr-6">
        <div className="hidden sm:flex rounded-full shadow-lg p-2 bg-[#ECEBDE]">+ Create</div>
        <div>Avatar Link</div>
      </div>
    </div>
  );
}

export default Navbar;
