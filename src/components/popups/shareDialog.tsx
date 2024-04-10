import React, { useState } from 'react';
import copyImg from './copy.svg'
import shareImg from './share.svg'
import './popup.css';
import QRCode from 'react-qr-code';

export const ShareDialog: React.FC<{
  params: URLSearchParams;
  handleClose: Function;
}> = ({ params, handleClose }) => {

  const [shareIcon, markCopied] = useState(shareImg)

  const url = `${window.location.origin}/${
    window.location.pathname.split('/')[1]
  }/?${params.toString()}`;

  const shareData = {
    title: "Codenames",
    text: "Open a cooperative game",
    url: url,
  };

  return (
    <div className="popup-container">
      <div className='popup'>
        <div style={{display:'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1em'}}>
          <span>Scan the QR or use the button bellow</span>
          <button onClick={()=>handleClose()} style={{padding: '7px 14px'}}>
            x
          </button>
        </div>
        
        
        <div style={{display:'flex', justifyContent: 'center', gap: '0.2em'}}>
          {
           <QRCode
           style={{ height: "auto", width: "90%" }}
           value={url}
           />
          }
        </div>

        
        <div style={{display:'flex', justifyContent: 'center', gap: '0.2em'}}>
          <button onClick={()=>{
            try {
              navigator.share(shareData)
            } catch (error) {
              navigator.clipboard.writeText(url)
              if(shareIcon === shareImg){
                markCopied(copyImg)
                setTimeout(() => {
                  markCopied(shareImg)
                }, 2000);
              }
            }
          }}>
            <img className='popupIcon' src={shareIcon} alt="copy" />
          </button>
        </div>
      </div>
    </div>
  );
};


