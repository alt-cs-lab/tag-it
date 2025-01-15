function treeify(text, annotations) {
  var nodes = [{
    length: text.length,
    text: text,
    offset: 0
  }]

  for(let annotation of annotations) {
    applyAnnotation(nodes, annotation)
  }

  return nodes;
}

function applyAnnotation(nodes, annotation) {

  const {start, end} = annotation

  // find the start index
  var startIndex = 0
  while(start > nodes[startIndex].offset + nodes[startIndex].length) startIndex++
  var endIndex = startIndex
  while(end > nodes[endIndex].offset + nodes[startIndex].length) endIndex++

  // is the annotation entirely within a node
  if(startIndex == endIndex) {
    const text = nodes[startIndex].text
    // break the text into three substrings
    const nodeOffset = nodes[startIndex].offset
    const before = text.substr(0, start - nodeOffset)
    const middle = text.substr(start - nodeOffset, end - start)
    const after = text.substr(end - nodeOffset) 
    // update the node list
    nodes.splice(startIndex, 1, 
      {text: before, length: before.length, offset: nodeOffset},
      {text: middle, length: middle.length, offset: nodeOffset + before.length, color: annotation.color, tag: annotation.tag},
      {text: after, length: after.length, offset: nodeOffset + before.length + middle.length}
    )
  }

}

export { treeify }  
