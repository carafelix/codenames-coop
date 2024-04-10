import React, { useState } from 'react';
import copyImg from './copy.svg'
import shareImg from './share.svg'
import check from './check.svg'
import './popup.css';
import QRCode from 'react-qr-code';

export const ShareDialog: React.FC<{
  params: URLSearchParams;
  handleClose: Function;
}> = ({ params, handleClose }) => {

  const [copy, markCopied] = useState(copyImg)

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
        <div style={{display:'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>Scan, copy or share</span>
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
            navigator.share(shareData)
          }}>
            <img src={shareImg} alt="copy" />
          </button>
          <textarea name="url" id="shareURL" cols={15} rows={2}
            style={{resize: 'none', color: 'black'}}
            defaultValue={url}>
          </textarea>
          <button onClick={()=>{
            navigator.clipboard.writeText(url)
            markCopied(check)
            setTimeout(() => {  
              markCopied(copy)
            }, 2000);
          }}>
            <img src={copy} alt="copy" />
          </button>
        </div>
      </div>
    </div>
  );
};


