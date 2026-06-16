<?php

namespace App\Controller;

use App\Entity\Cart;
use App\Entity\User;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

final class UserController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
    )
    {
    }

    #[Route('/api/register', methods: ['POST'])]
    public function registerUser(
        Request $request,
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $user = new User();
        $user->setUsername($data['username'])
            ->setEmail($data['email']);
        $user->setPassword(
            $this->passwordHasher->hashPassword($user, $data['password']));

        $cart = (new Cart())
            ->setUser($user);
        $user->setCart($cart);

        try {
            $this->entityManager->persist($user);
            $this->entityManager->persist($cart);
            $this->entityManager->flush();
        } catch (UniqueConstraintViolationException) {
            return $this->json([
                'message' => 'Username already exists'
            ], 409);
        }

        return $this->json([
            'success' => true
        ]);
    }

    /**
     * @return never
     * Stupid dummy route because symfony is stupid
     * If it doesnt exist, symfony's router returns a 404 for login before
     * the json_login functionality can catch.
     */
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(): never
    {
        throw new \LogicException('Should be handled by json_login.');
    }

    #[Route('/api/user', methods: ['GET'])]
    public function getUserData(): JsonResponse
    {
        $user = $this->getCurrentUser();

        return $this->json(
            $user,
            context: ['groups' => ['user:read']]
        );
    }

    #[Route('/api/user', methods: ['PUT'])]
    public function updateUser(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser();

        $data = json_decode(
            $request->getContent(), true
        );

        if (array_key_exists('firstName', $data)) {
            $user->setFirstName($data['firstName']);
        }

        if (array_key_exists('lastName', $data)) {
            $user->setLastName($data['lastName']);
        }

        if (array_key_exists('email', $data)) {
            $user->setEmail($data['email']);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $this->json(
            $user,
            context: ['groups' => ['user:read']]
        );
    }

    #[Route('/api/user/password', methods: ['PUT'])]
    public function changePassword(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser();

        $data = json_decode(
            $request->getContent(), true
        );

        if(!$this->passwordHasher->isPasswordValid(
            $user,
            $data['oldPassword']
        )){
            return $this->json(
                ['message' => 'Current password is incorrect'],
                400
            );
        }
        $user->setPassword(
            $this->passwordHasher->hashPassword($user, $data['newPassword']));

        $this->entityManager->flush();

        return $this->json(
            $user,
            context: ['groups' => ['user:read']]
        );
    }

    protected function getCurrentUser(): User
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            throw $this->createAccessDeniedException();
        }

        return $user;
    }
}
