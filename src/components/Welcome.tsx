import React from 'react';
import styled from "styled-components"


type WelcomeProps = {
  title: string,
  description: string,
}

const Welcome = ({ title, description }: WelcomeProps) => {
  return (
    <WelcomeBox className="welcome">
      <div className="title">{title}</div>
      <div className="description">{description}</div>
    </WelcomeBox>
  )
}

export default Welcome


const WelcomeBox = styled.div`
    text-align: center;
    margin-top: 50px;
    height: 200px;
    color: #ffffff;
    background: linear-gradient(
      180deg,
      #0090ff 0%,
      #39c1cb 99.99%,
      rgba(0, 144, 255, 0) 100%
    );

    .title {
      padding-top: 35px;
      font-family: "suisseintl";
      font-weight: bold;
      font-size: 24px;
      line-height: 36px;
      align-items: center;
      text-align: center;
     
    }

    .description {
      padding-top: 10px;
      font-family: "suisseintl";
      font-style: normal;
      font-weight: normal;
      font-size: 16px;
      line-height: 24px;
      max-width: 960px;
      margin: 0 auto;
    }
`


