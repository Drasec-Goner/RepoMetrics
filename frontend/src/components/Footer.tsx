import Container from "./ui/Container";

const Footer = () => {
  return (
    <div className="border-t border-slate-800 py-6 mt-20">
      <Container>
        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} RepoMetrics. All rights reserved.
        </p>
      </Container>
    </div>
  );
};

export default Footer;