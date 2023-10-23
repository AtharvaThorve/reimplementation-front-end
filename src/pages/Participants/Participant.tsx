import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { BsPersonFillAdd } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { RootState } from "../../store/store";
import { IParticipantResponse, ROLE } from "../../utils/interfaces";
import DeleteParticipant from "./ParticipantDelete";
import { participantColumns as PARPTICIPANT_COLUMNS } from "./participantColumns";

/**
 * @author Ankur Mundra on April, 2023
 */
const Participants = () => {
  const { error, isLoading, data: participantResponse, sendRequest: fetchParticipants } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IParticipantResponse;
  }>({ visible: false });

  useEffect(() => {
    if (!showDeleteConfirmation.visible) fetchParticipants({ url: `/participants/${auth.participant.id}/managed` });
  }, [fetchParticipants, location, showDeleteConfirmation.visible, auth.participant.id]);

  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteParticipantHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onEditHandle = useCallback(
    (row: TRow<IParticipantResponse>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<IParticipantResponse>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const tableColumns = useMemo(
    () => PARPTICIPANT_COLUMNS(onEditHandle, onDeleteHandle),
    [onDeleteHandle, onEditHandle]
  );

  const tableData = useMemo(
    () => (isLoading || !participantResponse?.data ? [] : participantResponse.data),
    [participantResponse?.data, isLoading]
  );

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Manage Participants</h1>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col md={{ span: 1, offset: 11 }}>
              <Button variant="outline-success" onClick={() => navigate("new")}>
                <BsPersonFillAdd />
              </Button>
            </Col>
            {showDeleteConfirmation.visible && (
              <DeleteParticipant participantData={showDeleteConfirmation.data!} onClose={onDeleteParticipantHandler} />
            )}
          </Row>
          <Row>
            <Table
              data={tableData}
              columns={tableColumns}
              columnVisibility={{
                id: false,
                institution: auth.participant.role === ROLE.SUPER_ADMIN.valueOf(),
              }}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Participants;
