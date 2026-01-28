/**
 * Ícone de Download personalizado
 * Baseado no design fornecido: seta para baixo com bandeja em fundo azul arredondado
 */
const DownloadIcon = ({ 
  size = 24, 
  color = '#ffffff', 
  strokeColor = '#000000',
  backgroundColor = '#1634FF',
  showBackground = false 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fundo azul arredondado (opcional) */}
      {showBackground && (
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="4"
          fill={backgroundColor}
          stroke={strokeColor}
          strokeWidth="0.5"
        />
      )}
      
      {/* Seta apontando para baixo - contorno preto primeiro */}
      <path
        d="M12 6V14M12 14L9 11M12 14L15 11"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Seta apontando para baixo - preenchimento branco */}
      <path
        d="M12 6V14M12 14L9 11M12 14L15 11"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Bandeja/container - contorno preto primeiro */}
      <path
        d="M6 16H18"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 16V18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18V16"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Bandeja/container - preenchimento branco */}
      <path
        d="M6 16H18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 16V18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18V16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default DownloadIcon
