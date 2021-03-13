import Nav from "react-bootstrap/Nav";
import BsNavbar from "react-bootstrap/Navbar";
import React from "react";
import Link from "next/link";
import { Github } from "react-bootstrap-icons";

export default () => {
  return (
    <div>
      <BsNavbar bg="light" variant="light">
        <BsNavbar.Brand>Get Image Coordinates</BsNavbar.Brand>
        <Nav className="mr-auto">
          <Link href="/" passHref>
            <Nav.Link>Home</Nav.Link>
          </Link>

          <Link href="/why" passHref>
            <Nav.Link>Why?</Nav.Link>
          </Link>
        </Nav>
        <a
          target="_blank"
          className=" float-right"
          href="https://github.com/lawynnj/get-image-coordinates"
        >
          <Github color="royalblue" size={25} />
        </a>
      </BsNavbar>
    </div>
  );
};
