import tw from 'tailwind-styled-components'
// import styled from 'styled-components'

// const RootCSS = styled.div``

export const Root = tw.div`
  flex
  flex-col
`

// const NetworkStatusItemsCSS = styled.div`
//   display: none;
//   ${RootCSS}:hover & {
//     display: block;
//   }
// `

export const NetworkStatusItems = tw.div`
  flex
  flex-col
  p-1
  fixed
  overflow-auto
  max-h-[75vh]
`

export const NetworkStatusItemRoot = tw.div`
  flex
  items-center
  gap-2
  p-2
`

export interface StatusIconStyleProps {
  $status: 'ready' | 'warning' | 'error'
}

export const StatusIcon = tw.div<StatusIconStyleProps>`
  rounded-full
  w-2
  h-2
  ${(p) => {
    switch (p.$status) {
      case 'ready':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
      default:
        return 'bg-red-500'
    }
  }}
`

export const NetworkLabel = tw.span`
  text-gray-400
  text-opacity-90
`
