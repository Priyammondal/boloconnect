import React, { useActionState, useCallback, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import { useSocket } from "../contexts/SocketProvider";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmit = async (previousState, formData) => {
    const email = formData.get("email");
    const roomNumber = formData.get("roomNumber");
    socket.emit("joinRoom", { email, roomNumber });
    return { email, roomNumber };
  };

  const [formState, formAction, isPending] = useActionState(handleSubmit, {});

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, roomNumber } = data;
      navigate(`/room/${roomNumber}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("joinRoom", handleJoinRoom);
    return () => socket.off("joinRoom", handleJoinRoom);
  }, [socket, handleJoinRoom]);

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={6} lg={4}>
          <Card className="shadow-sm p-4">
            <h2 className="text-center mb-4 fw-bold">Join a Room</h2>

            <Form action={formAction}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="email" className="fw-semibold">
                  Email ID
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label htmlFor="roomNumber" className="fw-semibold">
                  Room Number
                </Form.Label>
                <Form.Control
                  type="text"
                  name="roomNumber"
                  id="roomNumber"
                  placeholder="Enter room number"
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                disabled={isPending}
                className="w-100 fw-semibold"
              >
                {isPending ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Joining...
                  </>
                ) : (
                  "Join"
                )}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Lobby;
