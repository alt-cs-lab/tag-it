import { describe, it, expect } from 'vitest'

import { treeify } from '../annotation-tree.js'

describe('TextToChunks.js', () => {
    const text = 'An annotation is extra information associated with a particular point in a document or other piece of information.'  

    it('returns a single unhighlighted node when no annotation is given', () => {        
        const annotations = []
        const nodes = treeify(text, annotations)
        
        expect(nodes).toEqual(
          [{text: text, length: text.length, offset: 0}]
        )
    })

    it('returns a three-node list with a single annotation', () => {
      const annotations = [
        {
          start: "An annotation ".length,          
          end: "An annotation is extra information associated with a particular point".length,
          color: 'yellow',
          tag: 'an example'
        }
      ]
      const nodes = treeify(text, annotations)

      expect(nodes).toEqual([
        {
          text: "An annotation ",
          length: "An annotation ".length,
          offset: 0
        },
        {
          text: "is extra information associated with a particular point",
          length: "is extra information associated with a particular point".length,
          offset: "An annotation ".length,
          color: 'yellow',
          tag: 'an example'
        },
        {
          text: " in a document or other piece of information.",
          length: " in a document or other piece of information.".length,
          offset: "An annotation is extra information associated with a particular point".length
        }
      ])
    })

    it('returns a five-node list with a two consecutive annotations', () => {
      const annotations = [
        {
          start: "An annotation ".length,          
          end: "An annotation is extra information associated with a particular point".length,
          color: 'yellow',
          tag: 'an example'
        },
        { 
          start: "An annotation is extra information associated with a particular point in a document ".length,
          end: "An annotation is extra information associated with a particular point in a document or other piece".length,
          color: 'purple',
          tag: 'another example'
        }
      ]
      const nodes = treeify(text, annotations)

      expect(nodes).toEqual([
        {
          text: "An annotation ",
          length: "An annotation ".length,
          offset: 0
        },
        {
          text: "is extra information associated with a particular point",
          length: "is extra information associated with a particular point".length,
          offset: "An annotation ".length,
          color: 'yellow',
          tag: 'an example'
        },
        {
          text: " in a document ",
          length: " in a document ".length,
          offset: "An annotation is extra information associated with a particular point".length
        },
        {
          text: "or other piece",
          length: "or other piece".length,
          offset: "An annotation is extra information associated with a particular point in a document ".length,
          color: 'purple',
          tag: 'another example'
        },
        {
          text: " of information.",
          length: " of information.".length,
          offset: "An annotation is extra information associated with a particular point in a document or other piece".length
        }
      ])
    })

  })