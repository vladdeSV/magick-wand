import { expect, test } from 'bun:test'
import { CommandBuilder as CB } from '../source/commandBuilder.ts'

test('shape primitives', () => {
  expect(new CB().draw(d => d.point(10, 20)).args()).toEqual(['-draw', 'point 10,20'])
  expect(new CB().draw(d => d.line(0, 0, 100, 100)).args()).toEqual(['-draw', 'line 0,0 100,100'])
  expect(new CB().draw(d => d.rectangle(10, 10, 50, 50)).args()).toEqual(['-draw', 'rectangle 10,10 50,50'])
  expect(new CB().draw(d => d.roundRectangle(10, 10, 50, 50, 5, 5)).args()).toEqual([
    '-draw',
    'roundRectangle 10,10 50,50 5,5',
  ])
  expect(new CB().draw(d => d.arc(10, 10, 50, 50, 0, 90)).args()).toEqual(['-draw', 'arc 10,10 50,50 0,90'])
  expect(new CB().draw(d => d.ellipse(25, 25, 20, 15, 0, 360)).args()).toEqual(['-draw', 'ellipse 25,25 20,15 0,360'])
  expect(new CB().draw(d => d.circle(50, 50, 70, 50)).args()).toEqual(['-draw', 'circle 50,50 70,50'])
})

test('polyline, polygon and bezier', () => {
  expect(new CB().draw(d => d.polyline([10, 10], [20, 20], [30, 10])).args()).toEqual([
    '-draw',
    'polyline 10,10 20,20 30,10',
  ])
  expect(new CB().draw(d => d.polygon([10, 10], [20, 5], [30, 15], [15, 20])).args()).toEqual([
    '-draw',
    'polygon 10,10 20,5 30,15 15,20',
  ])
  expect(new CB().draw(d => d.bezier([10, 10], [20, 5], [30, 15], [40, 10])).args()).toEqual([
    '-draw',
    'bezier 10,10 20,5 30,15 40,10',
  ])
})

test('path and image', () => {
  expect(new CB().draw(d => d.path('M 10,10 L 20,20 Z')).args()).toEqual(['-draw', 'path "M 10,10 L 20,20 Z"'])
  expect(new CB().draw(d => d.image('Over', 10, 10, 100, 100, 'test.png')).args()).toEqual([
    '-draw',
    'image Over 10,10 100,100 "test.png"',
  ])
})

test('text and gravity', () => {
  expect(new CB().draw(d => d.text(50, 50, 'Hello World')).args()).toEqual(['-draw', 'text 50,50 "Hello World"'])
  expect(new CB().draw(d => d.gravity('Center')).args()).toEqual(['-draw', 'gravity Center'])
  expect(new CB().draw(d => d.gravity('NorthWest')).args()).toEqual(['-draw', 'gravity NorthWest'])
  expect(new CB().draw(d => d.gravity('SouthEast')).args()).toEqual(['-draw', 'gravity SouthEast'])
})

test('transformations', () => {
  expect(new CB().draw(d => d.rotate(45)).args()).toEqual(['-draw', 'rotate 45'])
  expect(new CB().draw(d => d.translate(10, 20)).args()).toEqual(['-draw', 'translate 10,20'])
  expect(new CB().draw(d => d.scale(2, 1.5)).args()).toEqual(['-draw', 'scale 2,1.5'])
  expect(new CB().draw(d => d.skewX(15)).args()).toEqual(['-draw', 'skewX 15'])
  expect(new CB().draw(d => d.skewY(10)).args()).toEqual(['-draw', 'skewY 10'])
})

test('pixel operations', () => {
  expect(new CB().draw(d => d.color(10, 10, 'point')).args()).toEqual(['-draw', 'color 10,10 point'])
  expect(new CB().draw(d => d.color(20, 20, 'replace')).args()).toEqual(['-draw', 'color 20,20 replace'])
  expect(new CB().draw(d => d.alpha(15, 15, 'floodfill')).args()).toEqual(['-draw', 'alpha 15,15 floodfill'])
  expect(new CB().draw(d => d.matte(15, 15, 'floodfill')).args()).toEqual(['-draw', 'matte 15,15 floodfill'])
})

test('chaining primitives joins them into one -draw argument', () => {
  expect(new CB().draw(d => d.line(0, 0, 100, 100).text(0, 50, 'hello world')).args()).toEqual([
    '-draw',
    'line 0,0 100,100 text 0,50 "hello world"',
  ])
  expect(new CB().draw(d => d.line(0, 0, 50, 50).line(50, 50, 100, 0)).args()).toEqual([
    '-draw',
    'line 0,0 50,50 line 50,50 100,0',
  ])
  expect(new CB().draw(d => d.circle(25, 25, 35, 25).text(10, 60, 'Hello')).args()).toEqual([
    '-draw',
    'circle 25,25 35,25 text 10,60 "Hello"',
  ])
})

test('chaining keeps settings and primitives in call order', () => {
  expect(new CB().draw(d => d.translate(50, 50).rotate(45).rectangle(0, 0, 20, 20)).args()).toEqual([
    '-draw',
    'translate 50,50 rotate 45 rectangle 0,0 20,20',
  ])
  expect(new CB().draw(d => d.gravity('Center').text(0, 0, 'Centered').point(0, 0)).args()).toEqual([
    '-draw',
    'gravity Center text 0,0 "Centered" point 0,0',
  ])
})

test('long chain mixing transformations, shapes and text', () => {
  expect(
    new CB()
      .draw(draw =>
        draw
          .translate(100, 100)
          .rotate(45)
          .scale(2, 2)
          .rectangle(-10, -10, 10, 10)
          .gravity('NorthEast')
          .text(0, 0, 'Rotated!')
      )
      .args()
  ).toEqual([
    '-draw',
    'translate 100,100 rotate 45 scale 2,2 rectangle -10,-10 10,10 gravity NorthEast text 0,0 "Rotated!"',
  ])
})

test('separate draw calls produce separate -draw arguments', () => {
  expect(
    new CB()
      .draw(d => d.line(0, 0, 100, 100))
      .draw(d => d.text(0, 50, 'hello world'))
      .args()
  ).toEqual(['-draw', 'line 0,0 100,100', '-draw', 'text 0,50 "hello world"'])
})
