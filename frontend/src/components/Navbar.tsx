import Container from "./ui/Container";

const Navbar = () => {
  return (
    <div className="border-b border-slate-800 py-4">
      <Container>
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-lg text-primary">
            RepoMetrics
          </h1>
        </div>
      </Container>
    </div>
  );
};

export default Navbar;