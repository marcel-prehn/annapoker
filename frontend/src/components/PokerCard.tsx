import React from "react";

interface PokerCardProps {
  onClickHandler: () => void,
  value: string,
  disabled: boolean,
}

export const PokerCard = (props: PokerCardProps) => {
  const {onClickHandler, value, disabled} = props
  return (
    <div className={"pokercard-container"}>
      <div className={`pokercard card-${value}`} onClick={disabled ? () => {
      } : onClickHandler}>
        <img className={"pokercard-image"} src={`/images/card-${value}.png`} alt={`Pokercard with Value ${value}`}/>
      </div>
      {disabled ? <div className={"pokercard-overlay"}/> : ""}
    </div>
  )
}