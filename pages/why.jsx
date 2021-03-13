import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import Jumbotron from "react-bootstrap/Jumbotron";

export default () => {
  return (
    <Layout title="Why? - The motivation">
      <Jumbotron>
        <h2>The Motivation</h2>
        <p>
          We had a task that required us to find over 10 pairs of x and y
          coordinates in an image and they needed to be in JSON format.
        </p>
        <p>
          There were <b>140+</b> images. This meant that we needed to find and
          format over <i>1400</i> pairs of x and y coordinates. 😱
        </p>
        <p>
          A pair of coordinates would be used to place a button on the image at
          the given x and y coordinate.
        </p>
        <h2>Solution</h2>
        <p>
          To make this tedious process more efficient, we decided to create an
          app that allows us to upload an image and click on a point in the
          image to copy the coordinates in a custom format. In our case it was
          JSON format.
        </p>
        <p>In construction: SHOW GIF</p>
      </Jumbotron>
    </Layout>
  );
};
