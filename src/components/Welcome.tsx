import React from 'react';

type WelcomeProps = {
    title: string,
    description: string,
}

const Welcome = ({title, description} : WelcomeProps) => {
  return (
    <div className="welcome">
    <div className="title">{title}</div>
    <div className="description">{description}</div>
</div>
  )
}

export default Welcome