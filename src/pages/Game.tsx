import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameCard, GameCardHeader, GameCardTitle, GameCardContent } from '@/components/ui/game-card'
import { GameButton } from '@/components/ui/game-button'
import { useGameStore } from '@/hooks/useGameStore'
import { CreditCard, AlertTriangle, Timer, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const Game = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentRoom, currentPlayer, drawCard, denounce, nextTurn, endGame } = useGameStore()
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [canDraw, setCanDraw] = useState(true)
  const [canDenounce, setCanDenounce] = useState(true)

  useEffect(() => {
    if (!currentRoom || !currentPlayer) {
      navigate('/')
      return
    }

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          nextTurn()
          setTimeLeft(60)
          setCanDraw(true)
          setCanDenounce(true)
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentRoom, currentPlayer, navigate, nextTurn])

  if (!currentRoom || !currentPlayer) {
    return null
  }

  const handleDrawCard = () => {
    const question = drawCard()
    if (question) {
      setCurrentQuestion(question)
      setCanDraw(false)
      toast({
        description: "Carte tirée ! Vous ne pouvez plus en tirer pendant ce tour.",
      })
    } else {
      toast({
        description: "Plus de cartes disponibles !",
        variant: "destructive"
      })
    }
  }

  const handleDenounce = () => {
    denounce()
    setCanDenounce(false)
    toast({
      description: "Dénonciation effectuée ! +10 points",
    })
  }

  const handleEndGame = () => {
    endGame()
    navigate('/ranking')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Game Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-game-yellow px-3 py-2 rounded-lg">
              <Timer size={18} />
              <span className="font-mono font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-game-purple text-game-beige px-3 py-2 rounded-lg">
              <Users size={18} />
              <span className="font-bold">
                {currentRoom.players.length}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-game-purple">
            C'est parti !
          </h1>
        </div>

        {/* Current Question Card */}
        {currentQuestion ? (
          <GameCard variant="purple" className="min-h-48 flex items-center justify-center">
            <GameCardContent className="text-center">
              <div className="mb-4">
                <CreditCard size={24} className="mx-auto mb-3 opacity-75" />
                <h3 className="text-lg font-bold mb-4">
                  Question pour {currentQuestion.targetPlayerName}
                </h3>
              </div>
              <p className="text-lg leading-relaxed">
                {currentQuestion.text}
              </p>
            </GameCardContent>
          </GameCard>
        ) : (
          <GameCard variant="beige" className="min-h-48 flex items-center justify-center">
            <GameCardContent className="text-center">
              <CreditCard size={48} className="mx-auto mb-4 text-game-purple" />
              <h3 className="text-xl font-bold text-game-purple mb-2">
                Tirez une carte !
              </h3>
              <p className="text-muted-foreground">
                Découvrez quelle question vous attend...
              </p>
            </GameCardContent>
          </GameCard>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <GameButton 
            variant="yellow" 
            size="full"
            onClick={handleDrawCard}
            disabled={!canDraw}
            className="flex items-center gap-2 h-14"
          >
            <CreditCard size={20} />
            {canDraw ? "Tirer une carte" : "Carte déjà tirée"}
          </GameButton>

          <GameButton 
            variant="danger" 
            size="full"
            onClick={handleDenounce}
            disabled={!canDenounce}
            className="flex items-center gap-2 h-14"
          >
            <AlertTriangle size={20} />
            {canDenounce ? "Dénoncer (+10 pts)" : "Déjà dénoncé"}
          </GameButton>
        </div>

        {/* Player Stats */}
        <GameCard variant="beige">
          <GameCardHeader>
            <GameCardTitle className="text-game-purple">
              🏆 Scores actuels
            </GameCardTitle>
          </GameCardHeader>
          <GameCardContent>
            <div className="space-y-2">
              {currentRoom.players
                .sort((a, b) => b.points - a.points)
                .map((player, index) => (
                <div 
                  key={player.id}
                  className={`flex justify-between items-center p-2 rounded ${
                    player.id === currentPlayer.id ? 'bg-game-yellow/20' : 'bg-background'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}</span>
                    <span className="font-medium">
                      {player.pseudo}
                      {player.id === currentPlayer.id && ' (Vous)'}
                    </span>
                  </div>
                  <span className="font-bold text-game-purple">
                    {player.points} pts
                  </span>
                </div>
              ))}
            </div>
          </GameCardContent>
        </GameCard>

        {/* Game controls (for demo) */}
        <div className="space-y-2">
          <GameButton 
            variant="outline" 
            size="full"
            onClick={handleEndGame}
          >
            Terminer la partie
          </GameButton>
        </div>

        {/* Game info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>⏱️ Vous avez 60 secondes par tour</p>
          <p>🎯 Une carte et une dénonciation max par tour</p>
        </div>
      </div>
    </div>
  )
}

export default Game