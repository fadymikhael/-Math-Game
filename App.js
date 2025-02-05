import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Configuration du jeu
const GAME_MODES = {
  EASY: {
    numberCount: 2,
    maxNumber: 20,
    timeLimit: 10, 
  },
  HARD: {
    numberCount: 3,
    maxNumber: 50,
    timeLimit: 5, 
  },
};

export default function App() {
  // États du jeu
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fonction pour générer des nombres aléatoires en fonction du mode choisi
  const generateNumbers = useCallback((mode) => {
    const config = GAME_MODES[mode];
    const newNumbers = [];
    for (let i = 0; i < config.numberCount; i++) {
      newNumbers.push(Math.floor(Math.random() * config.maxNumber) + 1);
    }
    return newNumbers;
  }, []);

  // Fonction appelée lorsque le temps est écoulé
  const handleTimeUp = useCallback(() => {
    setIsPlaying(false);
    const correctAnswer = numbers.reduce((sum, num) => sum + num, 0);
    setMessage(`Temps écoulé ! La réponse était ${correctAnswer}`);
  }, [numbers]);

  // Gestion du timer
  useEffect(() => {
    if (!isPlaying || !gameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameStarted, handleTimeUp]);

  // Démarrer une nouvelle partie (depuis le menu)
  const startGame = useCallback(
    (mode) => {
      const config = GAME_MODES[mode];
      const newNumbers = generateNumbers(mode);
      setGameMode(mode);
      setNumbers(newNumbers);
      setUserAnswer('');
      setMessage('');
      setTimeLeft(config.timeLimit);
      setIsPlaying(true);
      setGameStarted(true);
      setScore(0);
    },
    [generateNumbers]
  );

  // Fonction pour rejouer dans le même mode (bouton "Rejouer")
  const replayGame = useCallback(() => {
    if (gameMode) {
      const config = GAME_MODES[gameMode];
      const newNumbers = generateNumbers(gameMode);
      setNumbers(newNumbers);
      setUserAnswer('');
      setMessage('');
      setTimeLeft(config.timeLimit);
      setIsPlaying(true);
    }
  }, [gameMode, generateNumbers]);

  // Vérifier la réponse
  const checkAnswer = useCallback(() => {
    if (!isPlaying) return;

    Keyboard.dismiss();
    const answer = parseInt(userAnswer, 10);
    if (isNaN(answer)) {
      setMessage('Veuillez entrer un nombre valide');
      return;
    }

    const correctAnswer = numbers.reduce((sum, num) => sum + num, 0);

    if (answer === correctAnswer) {
      setScore((prev) => prev + 10);
      setMessage('Bravo ! +10 points');
      setTimeout(() => {
        const newNumbers = generateNumbers(gameMode);
        setNumbers(newNumbers);
        setUserAnswer('');
        setMessage('');
        setTimeLeft(GAME_MODES[gameMode].timeLimit);
      }, 1500);
    } else {
      setIsPlaying(false);
      setMessage(`Incorrect. La bonne réponse était ${correctAnswer}`);
    }
  }, [numbers, userAnswer, gameMode, isPlaying, generateNumbers]);

  // Retourner au menu principal
  const backToMenu = useCallback(() => {
    Keyboard.dismiss();
    setGameStarted(false);
    setGameMode(null);
    setScore(0);
    setIsPlaying(false);
    setTimeLeft(0);
  }, []);

  // Affichage du menu principal
  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Jeu de Mathématiques</Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonEasy]}
          onPress={() => startGame('EASY')}
        >
          <Text style={styles.buttonText}>Mode Facile</Text>
          <Text style={styles.buttonSubText}>2 nombres - 10 secondes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonHard]}
          onPress={() => startGame('HARD')}
        >
          <Text style={styles.buttonText}>Mode Difficile</Text>
          <Text style={styles.buttonSubText}>3 nombres - 5 secondes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Affichage du jeu
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.gameContainer}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text
          style={[
            styles.timer,
            timeLeft <= 3 ? styles.timerWarning : null,
          ]}
        >
          {timeLeft < 10 ? `0:0${timeLeft}` : `0:${timeLeft}`}
        </Text>
        <Text style={styles.question}>
          {numbers.join(' + ')} = ?
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={userAnswer}
          onChangeText={setUserAnswer}
          placeholder="Votre réponse"
          maxLength={5}
          editable={isPlaying}
        />
        <View style={styles.buttonRow}>
          {isPlaying ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonSubmit]}
              onPress={checkAnswer}
            >
              <Text style={styles.buttonText}>Valider</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.buttonSubmit]}
              onPress={replayGame}
            >
              <Text style={styles.buttonText}>Rejouer</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.buttonMenu]}
            onPress={backToMenu}
          >
            <Text style={styles.buttonText}>Menu</Text>
          </TouchableOpacity>
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 30,
    color: '#2c3e50',
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#2980b9',
  },
  timerWarning: {
    color: '#c0392b',
  },
  score: {
    fontSize: 24,
    marginBottom: 20,
    color: '#2c3e50',
  },
  question: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '80%',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  buttonEasy: {
    backgroundColor: '#2ecc71',
    width: '80%',
    justifyContent: 'center',
  },
  buttonHard: {
    backgroundColor: '#e74c3c',
    width: '80%',
  },
  buttonSubmit: {
    backgroundColor: '#3498db',
    flex: 1,
    marginRight: 5,
  },
  buttonMenu: {
    backgroundColor: '#95a5a6',
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSubText: {
    color: 'white',
    fontSize: 14,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    color: '#2c3e50',
  },
});
