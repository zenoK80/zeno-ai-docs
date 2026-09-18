'use client'

import { useId, useState } from 'react'
import { renderRichText } from './quiz-text'
import styles from './quiz.module.css'

const choiceMarkers = ['①', '②', '③', '④', '⑤', '⑥']

type QuizProps = {
  questionNumber: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  optionExplanations: string[]
}

export function Quiz({
  questionNumber,
  question,
  options,
  correctAnswer,
  explanation,
  optionExplanations,
}: QuizProps) {
  const quizId = useId()
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const hasAnswered = selectedAnswer !== null
  const isCorrect = selectedAnswer === correctAnswer
  const feedbackId = `${quizId}-feedback`

  function resetQuiz() {
    setSelectedAnswer(null)
  }

  return (
    <section className={styles.quiz} aria-labelledby={`${quizId}-question`}>
      <div className={styles.heading}>
        <span className={styles.questionNumber}>문제 {questionNumber}</span>
        <span className={styles.questionType}>4지선다</span>
      </div>

      {/* 문제에 표·출력 블록 같은 블록 요소가 올 수 있어 legend 대신 div로 둔다 */}
      <div className={styles.question} id={`${quizId}-question`}>
        {renderRichText(question, 'q')}
      </div>

      <fieldset aria-labelledby={`${quizId}-question`} className={styles.fieldset}>

        <div className={styles.options}>
          {options.map((option, index) => {
            const optionNumber = index + 1
            const isSelected = selectedAnswer === optionNumber
            const isAnswer = hasAnswered && optionNumber === correctAnswer
            const isWrongSelection = hasAnswered && isSelected && !isAnswer
            const optionClassName = [
              styles.option,
              isSelected ? styles.selected : '',
              isAnswer ? styles.correct : '',
              isWrongSelection ? styles.incorrect : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <label className={optionClassName} key={optionNumber}>
                <input
                  aria-describedby={hasAnswered ? feedbackId : undefined}
                  checked={isSelected}
                  className={styles.radio}
                  disabled={hasAnswered}
                  name={quizId}
                  onChange={() => setSelectedAnswer(optionNumber)}
                  type="radio"
                  value={optionNumber}
                />
                <span className={styles.marker} aria-hidden="true">
                  {choiceMarkers[index] ?? optionNumber}
                </span>
                <span className={styles.optionText}>{renderRichText(option, `o${optionNumber}`)}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {hasAnswered && (
        <div
          className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}`}
          id={feedbackId}
          role="status"
        >
          <p className={styles.result}>
            {isCorrect
              ? '정답이에요.'
              : `오답이에요. 정답은 ${choiceMarkers[correctAnswer - 1] ?? correctAnswer}입니다.`}
          </p>
          <div className={styles.explanation}>{renderRichText(explanation, 'e')}</div>

          <div className={styles.optionReview}>
            <p className={styles.optionReviewTitle}>선택지 해설</p>
            <ul>
              {options.map((_, index) => (
                <li key={index}>
                  <strong>{choiceMarkers[index] ?? index + 1}</strong>{' '}
                  {renderRichText(optionExplanations[index] ?? '', `x${index}`)}
                </li>
              ))}
            </ul>
          </div>

          <button className={styles.retryButton} onClick={resetQuiz} type="button">
            다시 풀기
          </button>
        </div>
      )}
    </section>
  )
}
