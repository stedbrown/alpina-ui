'use client'

import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { Button } from '../ui/button.js'
import { Progress } from '../ui/progress.js'
import { RadioGroup } from '../ui/radio-group.js'
import './questionnaire.css'

export interface QuestionnaireQuestion {
  id: string
  label: ReactNode
  options: readonly { value: string; label: ReactNode }[]
}
export interface QuestionnaireProps {
  label: string
  questions: readonly QuestionnaireQuestion[]
  onComplete: (answers: Record<string, string>) => void
  previousLabel?: string
  nextLabel?: string
  submitLabel?: string
  completeLabel?: string
  editLabel?: string
  className?: string
}

export function Questionnaire({
  label,
  questions,
  onComplete,
  previousLabel = 'Back',
  nextLabel = 'Next',
  submitLabel = 'Submit',
  completeLabel = 'Answers recorded.',
  editLabel = 'Edit answers',
  className = '',
}: QuestionnaireProps): ReactElement {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const step = Math.min(index, questions.length - 1)
  const question = questions[step]
  const id = useId()
  const heading = useRef<HTMLHeadingElement>(null)
  const shouldFocus = useRef(false)
  useEffect(() => {
    if (shouldFocus.current) {
      shouldFocus.current = false
      heading.current?.focus()
    }
  }, [step, done])

  function move(next: number) {
    shouldFocus.current = true
    setIndex(next)
  }

  return (
    <section className={('al-questionnaire ' + className).trim()} aria-label={label}>
      {question && !done ? (
        <>
          <div className="al-questionnaire-head">
            <span aria-hidden="true">
              {step + 1} / {questions.length}
            </span>
            <Progress value={step + 1} max={questions.length} label={label} />
          </div>
          <h3 ref={heading} tabIndex={-1} id={id}>
            {question.label}
          </h3>
          <RadioGroup
            className="al-questionnaire-options"
            aria-labelledby={id}
            label={null}
            name={id + question.id}
            options={question.options}
            value={answers[question.id] ?? ''}
            onValueChange={(answer) => setAnswers({ ...answers, [question.id]: answer })}
          />
          <div className="al-questionnaire-actions">
            {step > 0 && (
              <Button variant="ghost" onClick={() => move(step - 1)}>
                {previousLabel}
              </Button>
            )}
            <Button
              disabled={!question.options.some((item) => item.value === answers[question.id])}
              onClick={() => {
                if (step < questions.length - 1) move(step + 1)
                else {
                  const response = Object.fromEntries(questions.map(({ id }) => [id, answers[id]!]))
                  onComplete(response)
                  shouldFocus.current = true
                  setDone(true)
                }
              }}
            >
              {step === questions.length - 1 ? submitLabel : nextLabel}
            </Button>
          </div>
        </>
      ) : (
        done && (
          <>
            <h3 tabIndex={-1} ref={heading}>
              {completeLabel}
            </h3>
            <Button
              variant="outline"
              onClick={() => {
                move(0)
                setDone(false)
              }}
            >
              {editLabel}
            </Button>
          </>
        )
      )}
    </section>
  )
}
